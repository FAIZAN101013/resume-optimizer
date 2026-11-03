// Turns a profile row into the shape every resume theme renders.
//
// Themes stay dumb: they lay out this document and nothing else. Adding a
// theme never means touching the data, and fixing the data never means
// touching four themes.

/** "2025-03" -> "03/2025". Leaves anything unparseable alone. */
export function formatMonth(value) {
  if (!value) return ''

  const match = String(value).match(/^(\d{4})-(\d{2})/)
  if (!match) return String(value)

  return `${match[2]}/${match[1]}`
}

export function formatRange(start, end, current) {
  const from = formatMonth(start)
  const to = current ? 'Present' : formatMonth(end)

  if (from && to) return `${from} – ${to}`
  return from || to || ''
}

/**
 * Free text into bullets. Users type one per line; leading markers are
 * stripped so "- Built X" and "Built X" render identically.
 */
export function toBullets(text) {
  if (!text) return []

  return String(text)
    .split('\n')
    .map((line) => line.replace(/^\s*[-•*]\s*/, '').trim())
    .filter(Boolean)
}

/** Splits a flat list into n roughly equal columns, filling column-wise. */
export function splitColumns(items, columns = 2) {
  if (!items?.length) return []

  const perColumn = Math.ceil(items.length / columns)
  const result = []

  for (let i = 0; i < columns; i++) {
    const slice = items.slice(i * perColumn, (i + 1) * perColumn)
    if (slice.length) result.push(slice)
  }

  return result
}

function cleanUrl(url) {
  if (!url) return null
  return String(url).replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export function buildResumeDocument(profile, user) {
  if (!profile) profile = {}

  const links = [
    profile.portfolio && { key: 'portfolio', label: 'Portfolio', href: profile.portfolio },
    profile.linkedin && { key: 'linkedin', label: 'LinkedIn', href: profile.linkedin },
    profile.github && { key: 'github', label: 'GitHub', href: profile.github },
  ].filter(Boolean)

  return {
    name: profile.full_name || '',
    headline: profile.job_title || '',
    email: profile.email || user?.email || '',
    phone: profile.phone || '',
    location: profile.location || '',
    links,
    summary: profile.bio || '',

    experience: (profile.experience || []).map((item) => ({
      title: item.title || '',
      company: item.company || '',
      location: item.location || '',
      type: item.employment_type || '',
      range: formatRange(item.start_date, item.end_date, item.current),
      bullets: toBullets(item.description),
    })),

    projects: (profile.projects || []).map((item) => ({
      name: item.name || '',
      role: item.role || '',
      tech: item.tech || '',
      url: item.url || item.repo_url || '',
      urlLabel: cleanUrl(item.url || item.repo_url),
      bullets: toBullets(item.description),
    })),

    education: (profile.education || []).map((item) => ({
      degree: [item.degree, item.field].filter(Boolean).join(' in '),
      school: item.school || '',
      range: formatRange(item.start_date, item.end_date),
      grade: item.grade || '',
    })),

    certifications: (profile.certifications || []).map((item) => ({
      name: item.name || '',
      issuer: item.issuer || '',
      date: formatMonth(item.issue_date),
      url: item.credential_url || '',
    })),

    skills: profile.skills || [],
  }
}

/**
 * What's missing before this is worth printing. Shown as guidance rather
 * than blocking — an incomplete resume is still the user's to export.
 */
export function documentGaps(doc) {
  const gaps = []

  if (!doc.name) gaps.push('your name')
  if (!doc.email) gaps.push('an email address')
  if (!doc.experience.length && !doc.projects.length) {
    gaps.push('at least one role or project')
  }
  if (!doc.education.length) gaps.push('education')
  if (!doc.skills.length) gaps.push('skills')

  return gaps
}
