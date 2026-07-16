// Serverless email generator. The AI key stays server-side — it is never
// shipped to the browser.

const TONE = `
Write in a warm, professional, human tone. Keep it to 3-5 short sentences.
Do not invent facts, dates, achievements, or details that were not provided.
Return ONLY the email body — no subject line, no markdown, no preamble.
Sign off as [Your Name].`

function buildPrompt(type, job, extra = {}) {
  const role = job.title || 'the role'
  const company = job.company || 'the company'
  const applied = job.application_date ? ` (applied on ${job.application_date})` : ''
  const contact = job.recruiter_name ? `Address it to ${job.recruiter_name}.` : ''

  const prompts = {
    followup: `Write a follow-up email to the recruiter at ${company} about my application for ${role}${applied}. Politely ask for an update. Friendly, not pushy. ${contact}`,

    thankyou: `Write a thank-you email after interviewing for ${role} at ${company}. Express genuine interest and reference the conversation generally. ${contact}`,

    interview_confirmation: `Write an email confirming my attendance at the upcoming interview for ${role} at ${company}. Confirm the scheduled time and ask about anything I should prepare. ${contact}`,

    interview_reschedule: `Write an email politely asking to reschedule my interview for ${role} at ${company}. Apologise briefly, do not invent a specific excuse, and offer to work around their availability. ${contact}`,

    withdrawal: `Write a brief, gracious email withdrawing my application for ${role} at ${company}. Thank them for their time. Do not give a specific reason. ${contact}`,

    recruiter_outreach: `Write a short cold outreach email to a recruiter at ${company} expressing interest in ${role}. Lead with genuine interest in the company. Do not claim any specific experience beyond what is provided below. ${contact}`,

    status_inquiry: `Write a short, courteous email asking about the current status of my application for ${role} at ${company}${applied}. ${contact}`,
  }

  if (!prompts[type]) return null

  // Grounding context. Everything the model is allowed to treat as fact.
  let context = ''
  if (job.description) {
    context += `\n\nJob description (for tone and relevance only):\n${String(job.description).slice(0, 1500)}`
  }
  if (extra.senderName) {
    context += `\n\nSender's name: ${extra.senderName}`
  }
  if (extra.notes) {
    context += `\n\nAdditional context from the sender:\n${String(extra.notes).slice(0, 500)}`
  }

  return prompts[type] + context + '\n' + TONE
}

// Used only when the AI provider is unreachable. The response flags these so
// the UI can tell the user it is a template, not a generated draft.
function fallbackEmail(type, job) {
  const role = job.title || 'the role'
  const company = job.company || 'your company'

  const bodies = {
    followup: `Hi,\n\nI hope you're doing well. I wanted to follow up on my application for the ${role} position at ${company}.\n\nI remain very interested in the opportunity and would appreciate any update on the hiring process.\n\nThank you for your time.\n\nBest regards,\n[Your Name]`,

    thankyou: `Hi,\n\nThank you for taking the time to speak with me about the ${role} position at ${company}.\n\nI enjoyed our conversation and am excited about the possibility of contributing to your team.\n\nBest regards,\n[Your Name]`,

    interview_confirmation: `Hi,\n\nThank you for the invitation to interview for the ${role} position at ${company}. I'm writing to confirm my attendance.\n\nPlease let me know if there's anything I should prepare in advance.\n\nBest regards,\n[Your Name]`,

    interview_reschedule: `Hi,\n\nThank you for scheduling the interview for the ${role} position at ${company}.\n\nUnfortunately I have a conflict at the arranged time. Would it be possible to reschedule? I'm happy to work around your availability.\n\nApologies for the inconvenience.\n\nBest regards,\n[Your Name]`,

    withdrawal: `Hi,\n\nThank you for considering my application for the ${role} position at ${company}.\n\nAfter careful consideration, I'd like to withdraw my application. I appreciate your time and wish the team continued success.\n\nBest regards,\n[Your Name]`,

    recruiter_outreach: `Hi,\n\nI came across the ${role} opening at ${company} and wanted to introduce myself. The work your team is doing is genuinely interesting to me.\n\nI'd welcome the chance to discuss whether my background could be a fit. I've attached my resume for reference.\n\nBest regards,\n[Your Name]`,

    status_inquiry: `Hi,\n\nI hope you're well. I'm writing to ask about the current status of my application for the ${role} position at ${company}.\n\nI'd be grateful for any update you're able to share.\n\nThank you.\n\nBest regards,\n[Your Name]`,
  }

  return bodies[type] || null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { type, job, extra } = req.body || {}

  if (!type || !job) {
    return res.status(400).json({ error: 'Missing type or job' })
  }

  const prompt = buildPrompt(type, job, extra)
  if (!prompt) {
    return res.status(400).json({ error: `Unknown email type: ${type}` })
  }

  const apiKey = process.env.GEMINI_API_KEY

  // No key configured — say so plainly rather than passing a canned template
  // off as an AI draft.
  if (!apiKey) {
    return res.status(200).json({
      email: fallbackEmail(type, job),
      isFallback: true,
      fallbackReason: 'AI is not configured on the server (GEMINI_API_KEY is missing).',
    })
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 700 },
        }),
      },
    )

    const responseText = await response.text()

    if (!response.ok) {
      console.error('Gemini error:', response.status, responseText)
      return res.status(200).json({
        email: fallbackEmail(type, job),
        isFallback: true,
        fallbackReason: 'The AI service is temporarily unavailable.',
      })
    }

    const data = JSON.parse(responseText)
    const email = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''

    // An empty completion is a failure, not a success with no content.
    if (!email) {
      return res.status(200).json({
        email: fallbackEmail(type, job),
        isFallback: true,
        fallbackReason: 'The AI returned an empty response.',
      })
    }

    return res.status(200).json({ email, isFallback: false })
  } catch (err) {
    console.error('generate-email failed:', err)
    return res.status(200).json({
      email: fallbackEmail(type, job),
      isFallback: true,
      fallbackReason: 'Could not reach the AI service.',
    })
  }
}
