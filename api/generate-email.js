export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { type, job } = req.body;

  if (!type || !job) {
    return res.status(400).json({ error: "Missing type or job" });
  }

  const prompts = {
    followup: `Write a short professional follow-up email to a recruiter at ${job.company} for the ${job.role} role I applied for on ${job.date}. 3–4 sentences, friendly but not pushy. Sign off as [Your Name].`,
    thankyou: `Write a concise thank-you email to the interviewer at ${job.company} for the ${job.role} role. Express genuine interest. 3–4 sentences. Sign off as [Your Name].`,
    withdrawn: `Write a polite brief email to ${job.company} withdrawing my application for the ${job.role} position. Warm and professional. Sign off as [Your Name].`,
  };

  const jdContext = job.jobDescription
    ? `\n\nJob description context:\n${job.jobDescription.slice(0, 800)}`
    : "";

  const prompt =
    prompts[type] +
    jdContext +
    "\n\nReturn only the email body. No subject line, no markdown.";

  try {
    console.log(
      "GEMINI_API_KEY exists:",
      !!process.env.GEMINI_API_KEY
    );

    const response = await fetch(
     `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
          },
        }),
      }
    );

    const responseText = await response.text();

    console.log("Gemini Response:", responseText);

   if (!response.ok) {
  console.error("Gemini Error:", responseText);

  const fallbackEmails = {
    followup: `Hi,

I hope you're doing well. I wanted to follow up regarding my application for the ${job.role} position at ${job.company}.

I remain very interested in the opportunity and would appreciate any update regarding the hiring process.

Thank you for your time and consideration.

Best regards,
[Your Name]`,

    thankyou: `Hi,

Thank you for taking the time to interview me for the ${job.role} position at ${job.company}.

I enjoyed learning more about the role and remain very excited about the opportunity to contribute to your team.

Best regards,
[Your Name]`,

    withdrawn: `Hi,

Thank you for considering my application for the ${job.role} position at ${job.company}.

After careful consideration, I would like to withdraw my application. I appreciate your time and wish your team continued success.

Best regards,
[Your Name]`,
  };

  return res.status(200).json({
    email: fallbackEmails[type] || "Unable to generate email.",
  });
}

    const data = JSON.parse(responseText);

    const email =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return res.status(200).json({
      email: email.trim(),
    });
  } catch (err) {
    console.error("Server Error:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
}