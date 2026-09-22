import { generateJson, sendAiError } from './_gemini.js'

// Gemini responseSchema (OpenAPI subset). Forcing this shape is what lets the
// UI render scores and keyword lists without defensive parsing.
const SCHEMA = {
  type: 'OBJECT',
  properties: {
    overall_score: { type: 'INTEGER', description: '0-100 fit for this specific job' },
    ats_score: { type: 'INTEGER', description: '0-100 machine-readability' },
    score_reasoning: {
      type: 'STRING',
      description: 'Two or three sentences explaining the overall score, citing specifics.',
    },
    breakdown: {
      type: 'OBJECT',
      properties: {
        keyword_match: { type: 'INTEGER' },
        experience_relevance: { type: 'INTEGER' },
        skills_coverage: { type: 'INTEGER' },
        formatting: { type: 'INTEGER' },
        section_structure: { type: 'INTEGER' },
      },
      required: [
        'keyword_match', 'experience_relevance', 'skills_coverage',
        'formatting', 'section_structure',
      ],
    },
    matched_keywords: {
      type: 'ARRAY',
      description: 'Terms required by the job that DO appear in the resume.',
      items: {
        type: 'OBJECT',
        properties: {
          keyword: { type: 'STRING' },
          count: { type: 'INTEGER', description: 'Times it appears in the resume' },
        },
        required: ['keyword', 'count'],
      },
    },
    missing_keywords: {
      type: 'ARRAY',
      description: 'Terms the job requires that do NOT appear in the resume.',
      items: {
        type: 'OBJECT',
        properties: {
          keyword: { type: 'STRING' },
          importance: { type: 'STRING', enum: ['critical', 'important', 'nice-to-have'] },
          reason: { type: 'STRING', description: 'Why the job needs it — one short phrase.' },
        },
        required: ['keyword', 'importance', 'reason'],
      },
    },
    recommended_keywords: {
      type: 'ARRAY',
      description: 'Adjacent terms worth adding if truthful.',
      items: { type: 'STRING' },
    },
    missing_skills: {
      type: 'ARRAY',
      description: 'Skills, not just keywords, the candidate appears to lack.',
      items: { type: 'STRING' },
    },
    suggestions: {
      type: 'ARRAY',
      description: 'Specific, actionable fixes. Never generic advice.',
      items: {
        type: 'OBJECT',
        properties: {
          section: {
            type: 'STRING',
            enum: ['summary', 'experience', 'skills', 'education', 'projects', 'formatting', 'other'],
          },
          severity: { type: 'STRING', enum: ['high', 'medium', 'low'] },
          issue: { type: 'STRING', description: 'What is wrong, quoting the resume where possible.' },
          fix: { type: 'STRING', description: 'Exactly what to change.' },
        },
        required: ['section', 'severity', 'issue', 'fix'],
      },
    },
    experience_relevance_note: {
      type: 'STRING',
      description: 'How closely the candidate experience matches the role.',
    },
  },
  required: [
    'overall_score', 'ats_score', 'score_reasoning', 'breakdown',
    'matched_keywords', 'missing_keywords', 'recommended_keywords',
    'missing_skills', 'suggestions', 'experience_relevance_note',
  ],
}

function buildPrompt(resumeText, jobDescription, targetRole) {
  return `You are an experienced technical recruiter and ATS specialist reviewing a resume against one specific job.

${targetRole ? `TARGET ROLE: ${targetRole}\n` : ''}
=== JOB DESCRIPTION ===
${jobDescription.slice(0, 8000)}

=== RESUME ===
${resumeText.slice(0, 12000)}

=== HOW TO ASSESS ===

Score honestly. A resume that genuinely does not fit this job should score low; do not inflate to be encouraging. Reserve scores above 85 for resumes that would clearly pass a first-round screen.

Keywords: only list a term under matched_keywords if it actually appears in the resume text. Only list it under missing_keywords if the job description genuinely calls for it. Do not invent requirements the job never mentions.

Suggestions must be specific to THIS resume. Quote or reference the candidate's actual wording.

Bad:  "Improve your experience section."
Good: "Your internship bullet 'Worked on the dashboard' states no outcome. Say what you built and its effect — for example the number of users it served or the load time you reduced — using real figures you can verify."

Never instruct the candidate to claim experience, tools, employers or metrics they have not demonstrated. If something important is missing, the fix is to add it truthfully or to acknowledge the gap — never to fabricate.

Return only the structured JSON.`
}

// The model occasionally returns a score outside range or omits an array.
// Normalising here means the UI can trust its inputs.
const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)))
const asArray = (v) => (Array.isArray(v) ? v : [])

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { resumeText, jobDescription, targetRole } = req.body || {}

  if (!resumeText?.trim() || !jobDescription?.trim()) {
    return res.status(400).json({
      error: 'Both a resume and a job description are required.',
    })
  }

  if (resumeText.trim().length < 100) {
    return res.status(400).json({
      error: 'That resume is too short to analyse. Add more detail first.',
    })
  }

  if (jobDescription.trim().length < 50) {
    return res.status(400).json({
      error: 'That job description is too short to analyse against.',
    })
  }

  try {
    const result = await generateJson({
      prompt: buildPrompt(resumeText, jobDescription, targetRole),
      schema: SCHEMA,
      temperature: 0.2,
      maxOutputTokens: 6144,
    })

    const breakdown = result.breakdown || {}

    return res.status(200).json({
      overall_score: clamp(result.overall_score),
      ats_score: clamp(result.ats_score),
      score_reasoning: result.score_reasoning || '',
      breakdown: {
        keyword_match: clamp(breakdown.keyword_match),
        experience_relevance: clamp(breakdown.experience_relevance),
        skills_coverage: clamp(breakdown.skills_coverage),
        formatting: clamp(breakdown.formatting),
        section_structure: clamp(breakdown.section_structure),
      },
      matched_keywords: asArray(result.matched_keywords),
      missing_keywords: asArray(result.missing_keywords),
      recommended_keywords: asArray(result.recommended_keywords),
      missing_skills: asArray(result.missing_skills),
      suggestions: asArray(result.suggestions),
      experience_relevance_note: result.experience_relevance_note || '',
    })
  } catch (err) {
    return sendAiError(res, err)
  }
}
