// Splits raw resume text into the sections the spec asks for.
//
// This is deliberately heuristic rather than an AI call: it is instant, free
// and deterministic, and the user can edit anything it gets wrong. The
// original text is never modified — sections are slices of it.

export const SECTION_KEYS = [
  'summary',
  'skills',
  'experience',
  'education',
  'projects',
  'certifications',
]

export const SECTION_LABELS = {
  personal: 'Personal information',
  summary: 'Summary',
  skills: 'Skills',
  experience: 'Experience',
  education: 'Education',
  projects: 'Projects',
  certifications: 'Certifications',
  other: 'Other',
}

// Longest/most specific patterns first so "work experience" doesn't get
// claimed by a looser "experience" rule in another section.
const HEADING_PATTERNS = [
  ['summary', /^(professional\s+)?(summary|profile|objective|about\s+me|career\s+objective)\b/i],
  ['skills', /^(technical\s+|core\s+|key\s+)?(skills|competencies|technologies|tech\s+stack|proficiencies)\b/i],
  ['experience', /^(work\s+|professional\s+|employment\s+|relevant\s+)?(experience|history|internships?)\b/i],
  ['education', /^(education|academics?|academic\s+background|qualifications)\b/i],
  ['projects', /^(personal\s+|academic\s+|key\s+|selected\s+)?(projects?|portfolio)\b/i],
  ['certifications', /^(certifications?|licenses?|courses?|training|achievements?|awards?)\b/i],
]

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/
const PHONE_RE = /(\+?\d[\d\s().-]{7,}\d)/
const URL_RE = /\b((?:https?:\/\/|www\.)[^\s,;]+|(?:linkedin\.com|github\.com)\/[^\s,;]+)/gi

// A heading is short, has no sentence punctuation, and isn't a bullet.
function looksLikeHeading(line) {
  const trimmed = line.trim()

  if (!trimmed || trimmed.length > 60) return false
  if (/^[-•*\d]/.test(trimmed)) return false
  if (/[.;,]$/.test(trimmed)) return false

  // A line with several words and no heading keyword is prose, not a heading.
  return trimmed.split(/\s+/).length <= 6
}

function matchHeading(line) {
  const cleaned = line.trim().replace(/^[^\w]+|[^\w]+$/g, '')
  if (!looksLikeHeading(cleaned)) return null

  for (const [key, pattern] of HEADING_PATTERNS) {
    if (pattern.test(cleaned)) return key
  }
  return null
}

function extractContact(headText) {
  const urls = [...headText.matchAll(URL_RE)].map((m) => m[0].replace(/[.,)]+$/, ''))

  const pick = (re) => urls.find((u) => re.test(u)) || ''

  // The name is usually the first substantial line that isn't contact detail.
  const name = headText
    .split('\n')
    .map((l) => l.trim())
    .find(
      (l) =>
        l.length > 2 &&
        l.length < 50 &&
        !EMAIL_RE.test(l) &&
        !PHONE_RE.test(l) &&
        !/https?:|www\.|@/.test(l) &&
        /^[A-Za-z][A-Za-z\s.'-]+$/.test(l),
    )

  return {
    name: name || '',
    email: headText.match(EMAIL_RE)?.[0] || '',
    phone: headText.match(PHONE_RE)?.[0]?.trim() || '',
    linkedin: pick(/linkedin\.com/i),
    github: pick(/github\.com/i),
    website: urls.find((u) => !/linkedin\.com|github\.com/i.test(u)) || '',
  }
}

/**
 * @returns {{ personal: object, sections: Record<string,string>, detected: string[] }}
 */
export function parseResumeText(rawText) {
  const text = (rawText || '').replace(/\r\n?/g, '\n')
  const lines = text.split('\n')

  const found = []

  lines.forEach((line, index) => {
    const key = matchHeading(line)
    // First occurrence wins — resumes sometimes repeat a word later in prose.
    if (key && !found.some((f) => f.key === key)) {
      found.push({ key, index })
    }
  })

  found.sort((a, b) => a.index - b.index)

  // Everything above the first heading is the contact block.
  const headEnd = found.length ? found[0].index : Math.min(lines.length, 8)
  const personal = extractContact(lines.slice(0, headEnd).join('\n'))

  const sections = {}

  found.forEach((entry, i) => {
    const start = entry.index + 1
    const end = i + 1 < found.length ? found[i + 1].index : lines.length
    sections[entry.key] = lines.slice(start, end).join('\n').trim()
  })

  // No recognisable headings at all — keep the text rather than lose it.
  if (found.length === 0 && text.trim()) {
    sections.other = text.trim()
  }

  return {
    personal,
    sections,
    detected: found.map((f) => f.key),
  }
}

/** Rebuilds editable sections into plain text for analysis. */
export function sectionsToText(personal, sections) {
  const parts = []

  const contact = [personal?.name, personal?.email, personal?.phone, personal?.linkedin, personal?.github, personal?.website]
    .filter(Boolean)
    .join(' | ')

  if (contact) parts.push(contact)

  for (const key of [...SECTION_KEYS, 'other']) {
    const body = sections?.[key]
    if (body?.trim()) {
      parts.push(`${SECTION_LABELS[key].toUpperCase()}\n${body.trim()}`)
    }
  }

  return parts.join('\n\n')
}
