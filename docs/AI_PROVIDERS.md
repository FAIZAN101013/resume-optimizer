# AI providers — free tiers, chained

Every AI feature runs through a fallback chain of free providers
(`api/_providers.js`). A provider with no key is skipped; one that errors or
rate-limits hands the request to the next. **With only `GEMINI_API_KEY` set,
everything works exactly as before** — the rest are optional resilience.

## Who does what

| Feature | Chain | Why this order |
| --- | --- | --- |
| Resume analysis | gemini → groq → openrouter | Needs strict-schema JSON — Gemini's native `responseSchema` is the most reliable |
| AI resume review | gemini → groq → openrouter | Same: JSON with field paths |
| Interview prep | gemini → openrouter → groq | Largest response in the app; Groq's free tier has the tightest per-minute token budget, so it goes last |
| Section rewrite / cover letter | groq → mistral → gemini | Short prose, no schema — plays to Groq's speed |
| Emails | groq → mistral → gemini → template | Short and frequent; the canned template stays the honest last resort, flagged `isFallback` |

Responses include a `provider` field so you can see who actually answered.

## Keys (all free, no card)

| Env var | Get it at | Free tier (approx., changes over time) |
| --- | --- | --- |
| `GEMINI_API_KEY` | aistudio.google.com | ~1,500 req/day |
| `GROQ_API_KEY` | console.groq.com | ~1,000 req/day, ~6K tokens/min |
| `OPENROUTER_API_KEY` | openrouter.ai/keys | models tagged `:free` |
| `MISTRAL_API_KEY` | console.mistral.ai | daily token quota |

Set them in `.env` locally **and** in Vercel → Settings → Environment
Variables, then redeploy. **Never prefix with `VITE_`** — that would bundle
the key into the browser JavaScript.

Models are overridable if a default is retired:
`GROQ_MODEL`, `OPENROUTER_MODEL`, `MISTRAL_MODEL`.

## How JSON stays reliable off Gemini

Gemini enforces the schema natively. The OpenAI-compatible providers get the
schema written into the prompt, `response_format: json_object` where the
provider honours it, and their output run through a defensive parser that
strips markdown fences before parsing. A truncated response (`finish_reason:
"length"`) is treated as a failure so the chain moves on rather than shipping
half a JSON object.

## What was deliberately not used from the free-API lists

- **Browser-side "no key" APIs** (e.g. Puter) — our keys live server-side
  only; a client-side AI call would either expose a key or route user resume
  data through a third party we don't control.
- **One-off credit tiers** (Together $5, Fireworks $1, Novita $0.50) — they
  expire, then the feature silently dies.
- **Hugging Face Inference free tier** — too rate-limited and cold-start-y
  for interactive use.
