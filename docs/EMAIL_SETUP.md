# Email setup — Resend + Supabase

Two different emails, sent two different ways:

| Email | Sent by | Why |
| --- | --- | --- |
| **Verification code** on signup | Supabase Auth, transported by Resend SMTP | Supabase already issues secure, expiring, single-use tokens and rate-limits them. Hand-rolling this would be more code and less safe. |
| **Welcome email** after verification | `api/send-welcome.js` → Resend API | Not an auth event, so it's ours to send. |

---

## ⚠️ Read this first: the free-tier limit that will bite you

Resend's free tier gives you **3,000 emails/month, 100/day** — plenty.

But **without a verified domain you can only send to the email address that owns
the Resend account.** Sending to any other address returns `403`, which
`api/_resend.js` reports in plain language.

So:

- **Testing today** — works immediately, but only to your own inbox.
- **Real users** — you need a domain (about ₹800–1,000/year). A Gmail address
  cannot be verified as a sending domain; `jobz.careers.app@gmail.com` is a
  mailbox, not a domain you control.

Everything below assumes you'll add a domain when you're ready. Until then,
sign up with the same address that owns your Resend account and it all works.

---

## 1. Resend

1. Sign up at [resend.com](https://resend.com) with `jobz.careers.app@gmail.com`.
2. **API Keys → Create API Key** (sending permission). Copy it — it's shown once.
3. *(When you have a domain)* **Domains → Add Domain**, then add the DKIM/SPF
   records it gives you at your registrar. Verification usually takes minutes.

## 2. Environment variables

Add to `.env` locally **and** to Vercel (Project → Settings → Environment Variables):

```env
RESEND_API_KEY=re_xxxxxxxxxxxx

# With a verified domain:
RESEND_FROM=JoBz <hello@yourdomain.com>
# Without one, leave RESEND_FROM unset — the code falls back to
# onboarding@resend.dev, which only delivers to your own address.

APP_URL=https://resume-optimizer-topaz-eight.vercel.app
SUPPORT_EMAIL=jobz.careers.app@gmail.com
```

`.env` is gitignored — set these in the Vercel dashboard too, or production
will report "Email is not configured".

## 3. Point Supabase at Resend

Supabase's built-in email service is rate-limited to a handful of messages per
hour — fine for one developer, useless for real signups. Custom SMTP removes that.

**Supabase Dashboard → Project Settings → Authentication → SMTP Settings →
Enable Custom SMTP:**

| Field | Value |
| --- | --- |
| Host | `smtp.resend.com` |
| Port | `587` |
| Username | `resend` |
| Password | your `RESEND_API_KEY` |
| Sender email | `hello@yourdomain.com` (or `onboarding@resend.dev` while testing) |
| Sender name | `JoBz` |

## 4. Switch the confirmation email to a code

By default Supabase emails a *link*. This app asks for a **6-digit code**, so
the template has to send one.

**Authentication → Email Templates → Confirm signup**, and replace the body with:

```html
<h2>Confirm your email</h2>

<p>Your JoBz verification code is:</p>

<p style="font-size:28px;font-weight:700;letter-spacing:8px;font-family:monospace;">
  {{ .Token }}
</p>

<p>This code expires in one hour. If you didn't create a JoBz account, ignore this email.</p>
```

`{{ .Token }}` is the 6-digit code. `{{ .ConfirmationURL }}` is the link — using
the link template while the UI asks for a code is the one mistake that makes
this flow look broken.

Make sure **Authentication → Providers → Email → Confirm email** is **on**.
With it off, `signUp` returns a live session, no code is sent, and the app
skips straight to the dashboard (which is handled, just not what you want).

## 5. Database

Run `supabase/migrations/0002_welcome_email.sql`. It adds one column,
`profiles.welcome_email_sent_at`, so the welcome email can only ever go out once.

---

## How it behaves

```
Register (email + password)
   → supabase.auth.signUp
   → Supabase mails a 6-digit code via Resend
   → VerifyCode screen; auto-submits on the 6th digit
   → supabase.auth.verifyOtp  → session
   → POST /api/send-welcome   → welcome email via Resend
   → /dashboard
```

**Google sign-in skips all of this** — the address is already verified by
Google, so there's no code step. The welcome email isn't currently sent for
OAuth signups; if you want that, call `sendWelcomeEmail()` after the OAuth
redirect lands (it's safe to call repeatedly — the server checks
`welcome_email_sent_at`).

## Why `/api/send-welcome` can't be abused

It never takes a recipient from the request body. It reads the caller's
`Authorization: Bearer <access_token>`, resolves it against Supabase, and sends
only to **that** user's address. Without this, anyone could use the endpoint to
send JoBz-branded email to any inbox they liked.

Profile reads and writes inside the route use the caller's own token, so row
level security applies exactly as it does in the browser — no service-role key
is needed anywhere in this app.

## Testing locally

`npm run dev` does **not** serve `/api`. Use:

```bash
npm run dev:api      # vercel dev
```

The signup code still arrives on plain `npm run dev` (Supabase sends it
server-side), but the welcome email will not — that route isn't running.

## When it doesn't work

| Symptom | Cause |
| --- | --- |
| Code email never arrives | Custom SMTP not enabled, or you hit Supabase's built-in hourly limit |
| Email contains a link, not a code | Template still uses `{{ .ConfirmationURL }}` |
| `403` from Resend | No verified domain — you can only email your own address |
| "Email is not configured" | `RESEND_API_KEY` missing on Vercel |
| Welcome email never sends | Running `npm run dev` instead of `npm run dev:api` |
| No code step at all | "Confirm email" is off in Supabase |
