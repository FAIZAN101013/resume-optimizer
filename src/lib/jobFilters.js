import { PRIORITIES, JOB_STATUSES } from './constants'

export const SORT_OPTIONS = [
  { key: 'created_desc', label: 'Recently added' },
  { key: 'created_asc', label: 'Oldest added' },
  { key: 'applied_desc', label: 'Applied — newest' },
  { key: 'applied_asc', label: 'Applied — oldest' },
  { key: 'company_asc', label: 'Company A–Z' },
  { key: 'company_desc', label: 'Company Z–A' },
  { key: 'priority_desc', label: 'Priority — high first' },
  { key: 'status_asc', label: 'Status — pipeline order' },
]

export const DATE_RANGES = [
  { key: 'all', label: 'All time', days: null },
  { key: '7', label: 'Last 7 days', days: 7 },
  { key: '30', label: 'Last 30 days', days: 30 },
  { key: '90', label: 'Last 90 days', days: 90 },
]

// Rank lookups so sorting is a numeric compare rather than a chain of ifs.
const PRIORITY_RANK = Object.fromEntries(PRIORITIES.map((p, i) => [p, i]))
const STATUS_RANK = Object.fromEntries(JOB_STATUSES.map((s, i) => [s, i]))

const text = (value) => (value || '').toString().toLowerCase()

// Rows without a date sort last regardless of direction — a missing date is
// unknown, not "the beginning of time".
function byDate(a, b, field, direction) {
  const aTime = a[field] ? new Date(a[field]).getTime() : null
  const bTime = b[field] ? new Date(b[field]).getTime() : null

  if (aTime === null && bTime === null) return 0
  if (aTime === null) return 1
  if (bTime === null) return -1

  return direction === 'asc' ? aTime - bTime : bTime - aTime
}

const COMPARATORS = {
  created_desc: (a, b) => byDate(a, b, 'created_at', 'desc'),
  created_asc: (a, b) => byDate(a, b, 'created_at', 'asc'),
  applied_desc: (a, b) => byDate(a, b, 'application_date', 'desc'),
  applied_asc: (a, b) => byDate(a, b, 'application_date', 'asc'),
  company_asc: (a, b) => text(a.company).localeCompare(text(b.company)),
  company_desc: (a, b) => text(b.company).localeCompare(text(a.company)),
  priority_desc: (a, b) =>
    (PRIORITY_RANK[b.priority] ?? -1) - (PRIORITY_RANK[a.priority] ?? -1),
  status_asc: (a, b) =>
    (STATUS_RANK[a.status] ?? 99) - (STATUS_RANK[b.status] ?? 99),
}

function matchesSearch(job, query) {
  if (!query) return true

  return [
    job.company,
    job.title,
    job.location,
    job.recruiter_name,
    job.source,
    job.notes,
  ].some((field) => text(field).includes(query))
}

function withinRange(job, days) {
  if (!days) return true

  const stamp = job.application_date || job.created_at
  if (!stamp) return false

  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return new Date(stamp).getTime() >= cutoff
}

export function filterAndSortJobs(jobs, { search = '', status = 'All', dateRange = 'all', sort = 'created_desc' } = {}) {
  const query = search.trim().toLowerCase()
  const days = DATE_RANGES.find((r) => r.key === dateRange)?.days ?? null
  const comparator = COMPARATORS[sort] || COMPARATORS.created_desc

  return jobs
    .filter((job) => status === 'All' || job.status === status)
    .filter((job) => matchesSearch(job, query))
    .filter((job) => withinRange(job, days))
    .slice() // don't sort the caller's array in place
    .sort(comparator)
}

// An "Applied" row with no movement for a while is worth a nudge.
export function isStale(job, days = 7) {
  if (job.status !== 'Applied') return false

  const stamp = job.application_date || job.created_at
  if (!stamp) return false

  const elapsed = (Date.now() - new Date(stamp).getTime()) / (1000 * 60 * 60 * 24)
  return elapsed > days
}
