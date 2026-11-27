// Multi-provider AI transport with per-task fallback chains.
//
// Each route passes an ordered list of providers. A provider with no key is
// skipped; one that errors or rate-limits passes the request to the next.
// With only GEMINI_API_KEY set, everything behaves exactly as before — the
// extra providers are opt-in via env keys, never required.
//
// All of these have real free tiers with no card:
//   gemini      Google AI Studio    GEMINI_API_KEY       (~1,500 req/day)
//   groq        console.groq.com    GROQ_API_KEY         (~1,000 req/day, very fast)
//   openrouter  openrouter.ai/keys  OPENROUTER_API_KEY   (models tagged :free)
//   mistral     console.mistral.ai  MISTRAL_API_KEY      (daily token quota)

import {
  generateJson as geminiJson,
  generateText as geminiText,
  AiNotConfiguredError,
  AiRequestError,
} from './_gemini.js'

// Groq, Mistral and OpenRouter all speak the OpenAI chat-completions shape,
// so one caller covers the three of them.
const COMPAT = {
  groq: {
    url: 'https://api.groq.com/openai/v1/chat/completions',
    keyEnv: 'GROQ_API_KEY',
    model: () => process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    jsonMode: true,
  },
  mistral: {
    url: 'https://api.mistral.ai/v1/chat/completions',
    keyEnv: 'MISTRAL_API_KEY',
    model: () => process.env.MISTRAL_MODEL || 'mistral-small-latest',
    jsonMode: true,
  },
  openrouter: {
    url: 'https://openrouter.ai/api/v1/chat/completions',
    keyEnv: 'OPENROUTER_API_KEY',
    model: () => process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
    // Free-pool models often ignore response_format, so rely on the prompt
    // plus defensive parsing instead of pretending the flag works.
    jsonMode: false,
    headers: () => ({
      'HTTP-Referer': process.env.APP_URL || 'https://jobz.app',
      'X-Title': 'JoBz',
    }),
  },
}

function hasKey(name) {
  if (name === 'gemini') return !!process.env.GEMINI_API_KEY
  const provider = COMPAT[name]
  return !!(provider && process.env[provider.keyEnv])
}

async function compatChat(name, { prompt, temperature, maxOutputTokens, json }) {
  const provider = COMPAT[name]

  const response = await fetch(provider.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env[provider.keyEnv]}`,
      'Content-Type': 'application/json',
      ...(provider.headers ? provider.headers() : {}),
    },
    body: JSON.stringify({
      model: provider.model(),
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxOutputTokens,
      ...(json && provider.jsonMode ? { response_format: { type: 'json_object' } } : {}),
    }),
  })

  const raw = await response.text()

  if (!response.ok) {
    console.error(`${name} error:`, response.status, raw.slice(0, 300))
    throw new AiRequestError(`The AI service (${name}) rejected the request.`, response.status)
  }

  let payload
  try {
    payload = JSON.parse(raw)
  } catch {
    throw new AiRequestError(`The AI service (${name}) returned a malformed response.`, 502)
  }

  const choice = payload?.choices?.[0]
  const text = choice?.message?.content?.trim()

  if (!text) {
    throw new AiRequestError(`The AI (${name}) returned an empty response.`, 502)
  }

  // Truncated output is unusable — especially mid-JSON — so treat it as a
  // failure and let the chain move on.
  if (choice.finish_reason === 'length') {
    throw new AiRequestError(`The response from ${name} was cut short.`, 502)
  }

  return text
}

/** Parses JSON out of a completion that may be fenced or wrapped in prose. */
export function extractJson(text) {
  const stripped = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/, '')
    .trim()

  try {
    return JSON.parse(stripped)
  } catch {
    /* fall through to the bracket scan */
  }

  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start !== -1 && end > start) {
    try {
      return JSON.parse(stripped.slice(start, end + 1))
    } catch {
      /* fall through to the error */
    }
  }

  throw new AiRequestError('The AI returned output that was not valid JSON.', 502)
}

async function runChain(providers, attempt) {
  let lastError = null
  let anyConfigured = false

  for (const name of providers) {
    if (!hasKey(name)) continue
    anyConfigured = true

    try {
      return await attempt(name)
    } catch (err) {
      if (err instanceof AiNotConfiguredError) continue
      console.warn(`AI provider ${name} failed, trying next:`, err.message)
      lastError = err
    }
  }

  if (!anyConfigured) throw new AiNotConfiguredError()
  throw lastError || new AiRequestError('All AI providers failed.', 502)
}

/**
 * Structured JSON across the chain. Gemini gets its native responseSchema;
 * the OpenAI-compatible providers get the schema written into the prompt and
 * their output parsed defensively.
 */
export async function aiJson({
  prompt,
  schema,
  temperature = 0.3,
  maxOutputTokens = 4096,
  providers = ['gemini'],
}) {
  return runChain(providers, async (name) => {
    if (name === 'gemini') {
      const data = await geminiJson({ prompt, schema, temperature, maxOutputTokens })
      return { data, provider: 'gemini' }
    }

    const schemaNote = schema
      ? `\n\nRespond with ONLY a single JSON object — no markdown fences, no commentary — matching this schema:\n${JSON.stringify(schema)}`
      : '\n\nRespond with ONLY a single JSON object — no markdown fences, no commentary.'

    const text = await compatChat(name, {
      prompt: prompt + schemaNote,
      temperature,
      maxOutputTokens,
      json: true,
    })

    return { data: extractJson(text), provider: name }
  })
}

/** Plain text across the chain. */
export async function aiText({
  prompt,
  temperature = 0.5,
  maxOutputTokens = 2048,
  providers = ['gemini'],
}) {
  return runChain(providers, async (name) => {
    if (name === 'gemini') {
      const text = await geminiText({ prompt, temperature, maxOutputTokens })
      return { text, provider: 'gemini' }
    }

    const text = await compatChat(name, { prompt, temperature, maxOutputTokens, json: false })
    return { text, provider: name }
  })
}

export { AiNotConfiguredError, AiRequestError, sendAiError } from './_gemini.js'
