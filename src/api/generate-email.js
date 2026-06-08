export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }
 
  const { type, job } = req.body
  if (!type || !job) {
    return res.status(400).json({ error: "Missing type or job" })
  }
 
  const prompts = {
    followup:  `Write a short professional follow-up email to a recruiter at ${job.company} for the ${job.role} role I applied for on ${job.date}. 3–4 sentences, friendly but not pushy. Sign off as [Your Name].`,
    thankyou:  `Write a concise thank-you email to the interviewer at ${job.company} for the ${job.role} role. Express genuine interest. 3–4 sentences. Sign off as [Your Name].`,
    withdrawn: `Write a polite brief email to ${job.company} withdrawing my application for the ${job.role} position. Warm and professional. Sign off as [Your Name].`,
  }
 
  const jdContext = job.jobDescription
    ? `\n\nJob description context (for personalisation):\n${job.jobDescription.slice(0, 800)}`
    : ""
 
  const prompt =
    prompts[type] +
    jdContext +
    "\n\nReturn only the email body. No subject line, no preamble, no markdown."
 
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
        }),
      }
    )
 
    if (!response.ok) {
  const err = await response.text()
  console.error("Gemini Error:", err)
  return res.status(response.status).json({ error: err })
}
 
    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
    return res.status(200).json({ email: text.trim() })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}