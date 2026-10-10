// Email HTML. Deliberately table-free, inline-styled and narrow: email clients
// support far less CSS than browsers, and anything clever degrades badly.

const PURPLE = '#7C3AED'
const CYAN = '#06B6D4'

const APP_URL = process.env.APP_URL || 'https://resume-optimizer-topaz-eight.vercel.app'
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'jobz.careers.app@gmail.com'

function shell(bodyHtml) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="margin:0;padding:0;background:#f6f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;padding:32px 20px;">

      <div style="background:#ffffff;border:1px solid #e8e8ed;border-radius:16px;padding:32px;">
        <div style="font-size:22px;font-weight:700;color:#111827;margin-bottom:4px;">
          Jo<span style="background:linear-gradient(90deg,${PURPLE},${CYAN});-webkit-background-clip:text;background-clip:text;color:${PURPLE};">B</span>z
        </div>
        <div style="font-size:12px;color:#9ca3af;letter-spacing:0.08em;margin-bottom:28px;">
          TRACK &bull; APPLY &bull; GROW
        </div>

        ${bodyHtml}
      </div>

      <p style="text-align:center;font-size:12px;color:#9ca3af;margin-top:24px;line-height:1.6;">
        Questions? Just reply to this email, or write to
        <a href="mailto:${SUPPORT_EMAIL}" style="color:${PURPLE};text-decoration:none;">${SUPPORT_EMAIL}</a>.
      </p>
    </div>
  </body>
</html>`
}

function button(href, label) {
  return `<a href="${href}"
     style="display:inline-block;background:${PURPLE};color:#ffffff;text-decoration:none;
            font-size:14px;font-weight:600;padding:12px 22px;border-radius:10px;">
    ${label}
  </a>`
}

export function welcomeEmail({ name }) {
  const greeting = name ? `Welcome, ${name}` : 'Welcome to JoBz'

  const html = shell(`
    <h1 style="font-size:20px;font-weight:700;color:#111827;margin:0 0 12px;">${greeting}</h1>

    <p style="font-size:14px;line-height:1.65;color:#4b5563;margin:0 0 20px;">
      Your account is ready. JoBz keeps your whole job search in one place, so
      nothing slips: every application, every interview, every follow-up.
    </p>

    <p style="font-size:14px;line-height:1.65;color:#4b5563;margin:0 0 10px;font-weight:600;">
      A good first hour:
    </p>

    <ol style="font-size:14px;line-height:1.8;color:#4b5563;margin:0 0 24px;padding-left:20px;">
      <li>Fill in your profile — skills, experience and projects. Everything else reads from it.</li>
      <li>Add a job you're interested in, and paste the job description.</li>
      <li>Run the Resume Optimizer against it to see your match score and what's missing.</li>
    </ol>

    <p style="margin:0 0 28px;">${button(`${APP_URL}/dashboard`, 'Open your dashboard')}</p>

    <p style="font-size:13px;line-height:1.6;color:#6b7280;margin:0;border-top:1px solid #f0f0f3;padding-top:20px;">
      One honest note: the AI never invents experience for you. It sharpens how
      you describe what you've actually done — which is the part most people
      undersell.
    </p>
  `)

  const text = `${greeting}

Your account is ready. JoBz keeps your whole job search in one place.

A good first hour:
1. Fill in your profile - skills, experience and projects. Everything else reads from it.
2. Add a job you're interested in, and paste the job description.
3. Run the Resume Optimizer against it to see your match score and what's missing.

Open your dashboard: ${APP_URL}/dashboard

One honest note: the AI never invents experience for you. It sharpens how you
describe what you've actually done.

Questions? Reply to this email or write to ${SUPPORT_EMAIL}.`

  return { subject: 'Welcome to JoBz — here’s where to start', html, text }
}
