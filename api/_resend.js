// Resend transport. Uses the REST API directly rather than the SDK — it's one
// POST, and it keeps the serverless bundle small.
//
// Env:
//   RESEND_API_KEY  required
//   RESEND_FROM     e.g. "JoBz <hello@yourdomain.com>"
//                   Falls back to Resend's shared testing sender, which can
//                   ONLY deliver to the address that owns the Resend account.

const ENDPOINT = 'https://api.resend.com/emails'

// Resend's sandbox sender. Works with no domain, but only to your own address.
const TEST_FROM = 'JoBz <onboarding@resend.dev>'

export class EmailNotConfiguredError extends Error {
  constructor() {
    super('Email is not configured on the server (RESEND_API_KEY is missing).')
    this.name = 'EmailNotConfiguredError'
  }
}

export class EmailSendError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'EmailSendError'
    this.status = status
  }
}

export async function sendEmail({ to, subject, html, text, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new EmailNotConfiguredError()

  const payload = {
    from: process.env.RESEND_FROM || TEST_FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    // A text part meaningfully improves deliverability and is required by
    // some clients; never ship HTML alone.
    text,
    ...(replyTo ? { reply_to: replyTo } : {}),
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const body = await response.text()

  if (!response.ok) {
    console.error('Resend error:', response.status, body)

    // The single most common free-tier failure: no verified domain, so the
    // sandbox sender refuses any recipient other than the account owner.
    if (response.status === 403) {
      throw new EmailSendError(
        'Resend refused this recipient. On the free tier without a verified domain you can only email your own Resend account address.',
        403,
      )
    }

    throw new EmailSendError('The email service rejected the request.', response.status)
  }

  return JSON.parse(body)
}

export function sendEmailError(res, err) {
  if (err instanceof EmailNotConfiguredError) {
    return res.status(503).json({ error: err.message, code: 'EMAIL_NOT_CONFIGURED' })
  }
  if (err instanceof EmailSendError) {
    return res.status(502).json({ error: err.message, code: 'EMAIL_SEND_FAILED' })
  }

  console.error('Unexpected email failure:', err)
  return res.status(500).json({ error: 'Something went wrong sending that email.' })
}
