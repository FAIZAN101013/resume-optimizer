import { sendEmail, sendEmailError } from './_resend.js'
import { welcomeEmail } from './_emailTemplates.js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

/**
 * Resolves the caller's access token to a real user.
 *
 * The recipient is taken from THIS result, never from the request body —
 * otherwise the endpoint would be an open relay anyone could use to send
 * JoBz-branded mail to arbitrary addresses.
 */
async function getUserFromToken(token) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY,
    },
  })

  if (!response.ok) return null
  return response.json()
}

// Reads and writes go through the caller's own token, so row level security
// applies exactly as it does in the browser. No service key is needed here.
async function getProfile(token, userId) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=full_name,welcome_email_sent_at`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
    },
  )

  if (!response.ok) return null
  const rows = await response.json()
  return rows[0] || null
}

async function markWelcomeSent(token, userId) {
  await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ welcome_email_sent_at: new Date().toISOString() }),
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(503).json({
      error: 'Supabase is not configured on the server.',
      code: 'SUPABASE_NOT_CONFIGURED',
    })
  }

  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: 'Not signed in.' })
  }

  const user = await getUserFromToken(token)
  if (!user?.email) {
    return res.status(401).json({ error: 'That session is not valid.' })
  }

  try {
    const profile = await getProfile(token, user.id)

    // Once only. Without this, every page load that called it would send
    // another copy.
    if (profile?.welcome_email_sent_at) {
      return res.status(200).json({ sent: false, reason: 'already_sent' })
    }

    const name =
      profile?.full_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      null

    const { subject, html, text } = welcomeEmail({ name })

    await sendEmail({ to: user.email, subject, html, text })
    await markWelcomeSent(token, user.id)

    return res.status(200).json({ sent: true })
  } catch (err) {
    return sendEmailError(res, err)
  }
}
