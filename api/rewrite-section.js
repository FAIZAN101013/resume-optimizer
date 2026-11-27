import { aiText, sendAiError } from './_providers.js'

// The hard rule for this route: rewriting may change wording, order and
// emphasis. It may never add a fact that was not in the input.
const INTEGRITY_RULES = `
ABSOLUTE CONSTRAINTS — these override every other instruction:

- Never invent employers, job titles, degrees, institutions, dates, certifications, technologies or tools that are not present in the original text.
- Never invent numbers. Do not add metrics, percentages, user counts, revenue figures or timeframes unless that exact figure already appears in the original.
- Never upgrade scope or seniority. An intern does not become an engineer; "helped with" does not become "led".
- Never claim outcomes the original does not state.

If the original lacks measurable results, do NOT manufacture them. Instead, write the strongest truthful version and note what the candidate could add in the placeholder form [add: metric], which they can fill in themselves.

You may: rewrite for clarity, lead with stronger verbs, cut filler, reorder for relevance to the target job, and use terminology from the job description WHERE THE ORIGINAL ALREADY SUPPORTS IT.`

const SECTION_GUIDANCE = {
  summary: `Rewrite this professional summary. Two to three sentences. Lead with what the candidate is, then their most relevant strength for this job. No first-person pronouns. No clichés such as "results-driven" or "passionate team player".`,

  experience: `Rewrite these experience bullets. One bullet per line, starting with "- ". Each bullet: strong past-tense verb, what was built or done, and the effect where the original states one. Cut duties that read as a job description rather than a contribution.`,

  projects: `Rewrite these project descriptions. For each: what it does, what the candidate built, and the technologies named in the original. Keep it concrete and short.`,

  skills: `Reorganise this skills list so the abilities this job asks for come first. Group into sensible categories. Remove nothing the candidate listed. Add nothing they did not.`,

  cover_letter: `Write a cover letter of three or four short paragraphs using only the candidate's actual background. Open with genuine specific interest in this role, connect real experience to the requirements, and close with a straightforward call to action. No flattery, no invented enthusiasm for products they have not mentioned.`,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { section, content, jobDescription, targetRole, profile } = req.body || {}

  if (!section || !SECTION_GUIDANCE[section]) {
    return res.status(400).json({
      error: `Unknown section: ${section}`,
    })
  }

  // A cover letter is generated from the profile, so it is the one section
  // that can legitimately start without existing content.
  if (section !== 'cover_letter' && !content?.trim()) {
    return res.status(400).json({
      error: 'There is nothing in that section to rewrite yet.',
    })
  }

  const context = []

  if (jobDescription?.trim()) {
    context.push(`=== TARGET JOB DESCRIPTION ===\n${jobDescription.slice(0, 6000)}`)
  }

  if (targetRole?.trim()) {
    context.push(`=== TARGET ROLE ===\n${targetRole}`)
  }

  // Only for the cover letter, where the model needs the candidate's facts.
  if (section === 'cover_letter' && profile) {
    const facts = [
      profile.full_name && `Name: ${profile.full_name}`,
      profile.job_title && `Current title: ${profile.job_title}`,
      profile.location && `Location: ${profile.location}`,
      profile.skills?.length && `Skills: ${profile.skills.join(', ')}`,
      profile.bio && `Background: ${profile.bio}`,
    ].filter(Boolean)

    if (facts.length) {
      context.push(`=== CANDIDATE FACTS (the only facts you may use) ===\n${facts.join('\n')}`)
    }
  }

  const prompt = `You are helping a job seeker improve one section of their resume.

${SECTION_GUIDANCE[section]}

${context.join('\n\n')}

=== ORIGINAL ${section.toUpperCase().replace('_', ' ')} ===
${content?.trim() || '(none provided)'}

${INTEGRITY_RULES}

Return only the rewritten text. No preamble, no markdown fences, no commentary.`

  try {
    // Short prose suits the fast providers; Gemini is the safety net.
    const { text: rewritten, provider } = await aiText({
      prompt,
      temperature: 0.4,
      maxOutputTokens: 2048,
      providers: ['groq', 'mistral', 'gemini'],
    })

    return res.status(200).json({
      provider,
      section,
      original: content || '',
      rewritten,
    })
  } catch (err) {
    return sendAiError(res, err)
  }
}
