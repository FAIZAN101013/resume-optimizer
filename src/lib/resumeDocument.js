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

/* ------------------------------------------------------------ field paths */
// AI review suggestions carry a dot path like "experience.0.bullets.1" so a
// fix can be applied directly instead of being retyped by the user.

export function getByPath(obj, path) {
  if (!path) return undefined

  return path.split('.').reduce((acc, key) => {
    if (acc == null) return undefined
    return acc[Array.isArray(acc) ? Number(key) : key]
  }, obj)
}

/** Immutable set. Returns a new document; the original is untouched. */
export function setByPath(obj, path, value) {
  if (!path) return obj

  const keys = path.split('.')

  const walk = (node, depth) => {
    const key = keys[depth]
    const isLast = depth === keys.length - 1

    if (Array.isArray(node)) {
      const index = Number(key)
      if (Number.isNaN(index) || index < 0 || index >= node.length) return node

      const next = node.slice()
      next[index] = isLast ? value : walk(node[index], depth + 1)
      return next
    }

    if (node && typeof node === 'object') {
      if (!(key in node)) return node
      return { ...node, [key]: isLast ? value : walk(node[key], depth + 1) }
    }

    return node
  }

  return walk(obj, 0)
}

/** True when the path resolves to something that can actually be replaced. */
export function pathExists(obj, path) {
  return path ? getByPath(obj, path) !== undefined : false
}

/** Moves an item within an array field, for reordering sections. */
export function moveItem(items, from, to) {
  if (to < 0 || to >= items.length) return items

  const next = items.slice()
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

/** An empty document, for building a resume without a profile behind it. */
export function emptyDocument() {
  return {
    name: '', headline: '', email: '', phone: '', location: '',
    links: [], summary: '',
    experience: [], projects: [], education: [], certifications: [], skills: [],
  }
}

export const newExperience = () => ({ title: '', company: '', location: '', type: '', range: '', bullets: [] })
export const newProject = () => ({ name: '', role: '', tech: '', url: '', urlLabel: '', bullets: [] })
export const newEducation = () => ({ degree: '', school: '', range: '', grade: '' })
export const newCertification = () => ({ name: '', issuer: '', date: '', url: '' })
