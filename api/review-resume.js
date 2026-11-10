import { generateJson, sendAiError } from './_gemini.js'

// Reviews the resume on its own terms — no job description. This is the
// "is this a good resume" pass, as opposed to analyze-resume.js which asks
// "does this resume fit that job".
//
// Suggestions may carry a field path and a replacement, which lets the UI
// apply a fix in one click instead of making the user retype it.

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    overall: {
      type: 'OBJECT',
      properties: {
        score: { type: 'INTEGER', description: '0-100 quality of the resume itself' },
        summary: { type: 'STRING', description: 'Two sentences on the biggest opportunity.' },
      },
      required: ['score', 'summary'],
    },
    suggestions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          section: {
            type: 'STRING',
            enum: ['personal', 'summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'overall'],
          },
          severity: { type: 'STRING', enum: ['high', 'medium', 'low'] },
          message: {
            type: 'STRING',
            description: 'What to change and why, in one or two sentences. Reference the actual text.',
          },
          field_path: {
            type: 'STRING',
            description:
              'Dot path of the exact field to fix, e.g. "experience.0.bullets.1" or "education.0.range". Empty if the fix is not a single field.',
          },
          current_value: { type: 'STRING', description: 'The exact current text at that path. Empty if not applicable.' },
          suggested_value: {
            type: 'STRING',
            description:
              'Replacement text for that path. Empty unless you can write a complete, truthful replacement.',
          },
        },
        required: ['section', 'severity', 'message', 'field_path', 'current_value', 'suggested_value'],
      },
    },
  },
  required: ['overall', 'suggestions'],
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { document } = req.body || {}

  if (!document || typeof document !== 'object') {
    return res.status(400).json({ error: 'A resume document is required.' })
  }

  const hasContent =
    document.experience?.length || document.projects?.length || document.education?.length

  if (!hasContent) {
    return res.status(400).json({
      error: 'Add some experience, projects or education before running a review.',
    })
  }

  const prompt = `You are a senior technical recruiter reviewing a resume. There is no specific job — judge it as a general application for the candidate's stated field.

=== RESUME (JSON) ===
${JSON.stringify(document, null, 1).slice(0, 14000)}

=== WHAT TO LOOK FOR ===

Prioritise, in this order:
1. Bullets that describe duties instead of contributions, or that state no outcome.
2. Weak or repeated opening verbs.
3. Missing or malformed dates, and date ranges that are impossible or in the future.
4. Vague project descriptions that never say what the candidate built.
5. A summary that says nothing specific.
6. Missing contact details or links.
7. Formatting and consistency: inconsistent tense, trailing punctuation, capitalisation.

=== RULES ===

Every suggestion must reference this resume's actual content. Never generic advice.

field_path must be a real dot path into the JSON above, for example
"experience.0.bullets.1", "summary", "projects.2.tech", "education.0.range".
Leave it empty when the fix is not a single field.

Only fill suggested_value when you can write the complete replacement text
using ONLY facts already present. Never invent metrics, employers,
technologies or dates. If a bullet needs a number the candidate has not
given, leave suggested_value empty and say in the message what they should
add — do not write a placeholder number.

Return 5 to 12 suggestions, most important first. If the resume is genuinely
strong, return fewer rather than padding.

Return only the structured JSON.`

  try {
    const result = await generateJson({
      prompt,
      schema: SCHEMA,
      temperature: 0.25,
      maxOutputTokens: 6144,
    })

    const suggestions = (result.suggestions || []).map((s, i) => ({
      id: `s${i}`,
      section: s.section || 'overall',
      severity: s.severity || 'low',
      message: s.message || '',
      field_path: s.field_path || null,
      current_value: s.current_value || null,
      // Only offer one-click apply when there is genuinely something to apply.
      suggested_value: s.suggested_value?.trim() ? s.suggested_value.trim() : null,
    }))

    return res.status(200).json({
      overall: {
        score: Math.max(0, Math.min(100, Math.round(Number(result.overall?.score) || 0))),
        summary: result.overall?.summary || '',
      },
      suggestions,
    })
  } catch (err) {
    return sendAiError(res, err)
  }
}
