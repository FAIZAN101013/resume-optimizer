import { aiJson, sendAiError } from './_providers.js'

const QUESTION_LIST = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      question: { type: 'STRING' },
      why: { type: 'STRING', description: 'Why this is likely to come up for this role.' },
      approach: { type: 'STRING', description: 'How to structure a strong answer.' },
    },
    required: ['question', 'why', 'approach'],
  },
}

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    technical: QUESTION_LIST,
    behavioral: QUESTION_LIST,
    hr: QUESTION_LIST,
    questions_to_ask: {
      type: 'ARRAY',
      description: 'Questions the candidate should ask the interviewer.',
      items: { type: 'STRING' },
    },
    topics: {
      type: 'ARRAY',
      description: 'Subjects to revise before the interview, most important first.',
      items: {
        type: 'OBJECT',
        properties: {
          topic: { type: 'STRING' },
          detail: { type: 'STRING' },
          priority: { type: 'STRING', enum: ['high', 'medium', 'low'] },
        },
        required: ['topic', 'detail', 'priority'],
      },
    },
  },
  required: ['technical', 'behavioral', 'hr', 'questions_to_ask', 'topics'],
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { company, position, interviewType, jobDescription, candidateSkills } = req.body || {}

  if (!position?.trim() && !jobDescription?.trim()) {
    return res.status(400).json({
      error: 'A role or a job description is needed to prepare for.',
    })
  }

  const context = [
    company && `Company: ${company}`,
    position && `Role: ${position}`,
    interviewType && `Interview type: ${interviewType}`,
    candidateSkills?.length && `Candidate's stated skills: ${candidateSkills.join(', ')}`,
    jobDescription?.trim() && `\nJob description:\n${jobDescription.slice(0, 6000)}`,
  ]
    .filter(Boolean)
    .join('\n')

  const prompt = `You are preparing a candidate for a specific job interview.

${context}

Produce realistic preparation material for THIS role, not generic interview advice.

- technical: 6 to 8 questions drawn from the actual technologies and responsibilities named above. If the role is non-technical, cover the role's core practical skills instead.
- behavioral: 4 to 5 questions, each tied to something this job actually requires.
- hr: 3 to 4 questions about motivation, availability and expectations.
- questions_to_ask: 5 questions that show genuine thought about the team and the work. No questions whose answer is already in the job description.
- topics: what to revise, ordered by how likely it is to matter here.

For "approach", describe how to structure a good answer — do not write the answer for them, and never suggest claiming experience they do not have. Where a question would need a concrete example from their own history, say so.

${interviewType ? `Weight the material towards a ${interviewType} interview.` : ''}

Return only the structured JSON.`

  try {
    // The largest response in the app — Groq's free tier has the tightest
    // per-minute token budget, so it goes last.
    const { data: result, provider } = await aiJson({
      prompt,
      schema: SCHEMA,
      temperature: 0.4,
      maxOutputTokens: 8192,
      providers: ['gemini', 'openrouter', 'groq'],
    })

    return res.status(200).json({
      provider,
      technical: result.technical || [],
      behavioral: result.behavioral || [],
      hr: result.hr || [],
      questions_to_ask: result.questions_to_ask || [],
      topics: result.topics || [],
      generated_at: new Date().toISOString(),
    })
  } catch (err) {
    return sendAiError(res, err)
  }
}
