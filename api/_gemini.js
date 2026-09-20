// Shared Gemini transport for the serverless routes.
// Files prefixed with _ are not exposed as routes by Vercel.

const MODEL = 'gemini-2.5-flash'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

export class AiNotConfiguredError extends Error {
  constructor() {
    super('AI is not configured on the server (GEMINI_API_KEY is missing).')
    this.name = 'AiNotConfiguredError'
  }
}

export class AiRequestError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'AiRequestError'
    this.status = status
  }
}

/**
 * Calls Gemini and returns parsed JSON.
 *
 * `schema` is a Gemini responseSchema (OpenAPI subset). Passing one puts the
 * model in JSON mode, which is what makes the frontend able to render results
 * without defensive string parsing.
 */
export async function generateJson({ prompt, schema, temperature = 0.3, maxOutputTokens = 4096 }) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new AiNotConfiguredError()

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens,
      responseMimeType: 'application/json',
      ...(schema ? { responseSchema: schema } : {}),
    },
  }

  const response = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const raw = await response.text()

  if (!response.ok) {
    console.error('Gemini error:', response.status, raw)
    throw new AiRequestError('The AI service rejected the request.', response.status)
  }

  let payload
  try {
    payload = JSON.parse(raw)
  } catch {
    throw new AiRequestError('The AI service returned a malformed response.', 502)
  }

  const candidate = payload?.candidates?.[0]

  // A truncated response is invalid JSON, so surface it as its own failure
  // rather than letting JSON.parse throw something unhelpful.
  if (candidate?.finishReason === 'MAX_TOKENS') {
    throw new AiRequestError(
      'The response was cut short. Try a shorter resume or job description.',
      502,
    )
  }

  const text = candidate?.content?.parts?.[0]?.text
  if (!text) throw new AiRequestError('The AI returned an empty response.', 502)

  try {
    return JSON.parse(text)
  } catch {
    throw new AiRequestError('The AI returned output that was not valid JSON.', 502)
  }
}

/** Plain-text generation, for the rewriter. */
export async function generateText({ prompt, temperature = 0.5, maxOutputTokens = 2048 }) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new AiNotConfiguredError()

  const response = await fetch(`${ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature, maxOutputTokens },
    }),
  })

  const raw = await response.text()

  if (!response.ok) {
    console.error('Gemini error:', response.status, raw)
    throw new AiRequestError('The AI service rejected the request.', response.status)
  }

  const text = JSON.parse(raw)?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  if (!text) throw new AiRequestError('The AI returned an empty response.', 502)

  return text
}

/** Maps our error types onto a response. Keeps the routes uniform. */
export function sendAiError(res, err) {
  if (err instanceof AiNotConfiguredError) {
    return res.status(503).json({ error: err.message, code: 'AI_NOT_CONFIGURED' })
  }
  if (err instanceof AiRequestError) {
    return res.status(502).json({ error: err.message, code: 'AI_REQUEST_FAILED' })
  }

  console.error('Unexpected AI route failure:', err)
  return res.status(500).json({ error: 'Something went wrong. Please try again.' })
}
