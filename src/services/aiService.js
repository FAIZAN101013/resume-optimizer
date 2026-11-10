// Client wrapper for the serverless AI routes. The API key lives only on the
// server; the browser never sees it.

export class AiError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'AiError'
    this.code = code
  }

  get isNotConfigured() {
    return this.code === 'AI_NOT_CONFIGURED'
  }
}

async function postJson(path, body) {
  let response

  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new AiError('Could not reach the server. Check your connection.', 'NETWORK')
  }

  // The dev server serves index.html for unknown paths, so a non-JSON body
  // here almost always means the API routes are not running.
  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new AiError(
      'The API is not available. Run `vercel dev` instead of `npm run dev` to use AI features locally.',
      'NO_API',
    )
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new AiError(data.error || 'The request failed.', data.code)
  }

  return data
}

/** Extracts text from a PDF or DOCX via the server. */
export async function parseResumeFile(file) {
  const base64 = await fileToBase64(file)

  return postJson('/api/parse-resume', {
    fileName: file.name,
    fileType: file.type,
    data: base64,
  })
}

export async function analyzeResume({ resumeText, jobDescription, targetRole }) {
  return postJson('/api/analyze-resume', { resumeText, jobDescription, targetRole })
}

export async function rewriteSection({ section, content, jobDescription, targetRole, profile }) {
  return postJson('/api/rewrite-section', {
    section,
    content,
    jobDescription,
    targetRole,
    profile,
  })
}

export async function generateEmail({ type, job, extra }) {
  return postJson('/api/generate-email', { type, job, extra })
}

/** Reviews the resume on its own terms, with no job description. */
export async function reviewResume(document) {
  return postJson('/api/review-resume', { document })
}

export async function generateInterviewPrep({
  company,
  position,
  interviewType,
  jobDescription,
  candidateSkills,
}) {
  return postJson('/api/interview-prep', {
    company,
    position,
    interviewType,
    jobDescription,
    candidateSkills,
  })
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    // readAsDataURL gives "data:<mime>;base64,<payload>" — strip the prefix.
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.readAsDataURL(file)
  })
}
