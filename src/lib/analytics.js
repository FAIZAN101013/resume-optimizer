import { JOB_STATUSES } from './constants'

const DAY = 24 * 60 * 60 * 1000

// Statuses that mean the application progressed at least to a conversation.
const REACHED_INTERVIEW = ['Interview', 'Offer']
const CLOSED = ['Offer', 'Rejected', 'Withdrawn']

function toDate(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Applications actually sent — "Saved" rows are not applications yet. */
export function appliedJobs(jobs) {
  return jobs.filter((j) => j.status !== 'Saved')
}

export function statusCounts(jobs) {
  return Object.fromEntries(
    JOB_STATUSES.map((s) => [s, jobs.filter((j) => j.status === s).length]),
  )
}

/**
 * Conversion funnel. Percentages are relative to applications sent, so a
 * user with nothing applied gets zeroes rather than NaN.
 */
export function funnel(jobs, interviews = []) {
  const applied = appliedJobs(jobs)
  const total = applied.length

  const reachedInterview = applied.filter((j) =>
    REACHED_INTERVIEW.includes(j.status),
  ).length

  // Count from the interviews table where it has data, since a job can have
  // several rounds; fall back to the status when it doesn't.
  const interviewCount = interviews.length || reachedInterview

  const finalRounds = interviews.filter((i) => i.interview_type === 'Final').length
  const offers = applied.filter((j) => j.status === 'Offer').length
  const rejections = applied.filter((j) => j.status === 'Rejected').length

  const pct = (n) => (total ? Math.round((n / total) * 100) : 0)

  return {
    total,
    reachedInterview,
    interviewCount,
    finalRounds,
    offers,
    rejections,
    interviewRate: pct(reachedInterview),
    offerRate: pct(offers),
    rejectionRate: pct(rejections),
    // Of those who got an interview, how many converted.
    interviewToOfferRate: reachedInterview
      ? Math.round((offers / reachedInterview) * 100)
      : 0,
  }
}

/** Buckets applications into the last `weeks` ISO weeks, oldest first. */
export function applicationsPerWeek(jobs, weeks = 12) {
  const applied = appliedJobs(jobs)
  const now = new Date()

  // Anchor to the start of the current week (Monday).
  const anchor = new Date(now)
  const weekday = (anchor.getDay() + 6) % 7
  anchor.setHours(0, 0, 0, 0)
  anchor.setDate(anchor.getDate() - weekday)

  const buckets = []

  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(anchor.getTime() - i * 7 * DAY)
    const end = new Date(start.getTime() + 7 * DAY)

    const count = applied.filter((job) => {
      const d = toDate(job.application_date || job.created_at)
      return d && d >= start && d < end
    }).length

    buckets.push({
      label: start.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      start,
      count,
    })
  }

  return buckets
}

/** Buckets applications into the last `months` calendar months, oldest first. */
export function applicationsPerMonth(jobs, months = 6) {
  const applied = appliedJobs(jobs)
  const now = new Date()
  const buckets = []

  for (let i = months - 1; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)

    const count = applied.filter((job) => {
      const d = toDate(job.application_date || job.created_at)
      return d && d >= start && d < end
    }).length

    buckets.push({
      label: start.toLocaleDateString(undefined, { month: 'short' }),
      count,
    })
  }

  return buckets
}

function groupBy(jobs, key, limit) {
  const counts = new Map()

  for (const job of jobs) {
    const value = (job[key] || '').trim() || 'Not set'
    counts.set(value, (counts.get(value) || 0) + 1)
  }

  const rows = [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)

  return limit ? rows.slice(0, limit) : rows
}

export const byCompany = (jobs, limit = 8) => groupBy(appliedJobs(jobs), 'company', limit)
export const byWorkType = (jobs) => groupBy(appliedJobs(jobs), 'work_type')
export const bySource = (jobs, limit = 8) => groupBy(appliedJobs(jobs), 'source', limit)

/**
 * Average days from application to first interview.
 * Only counts pairs where both dates exist and the interview is not earlier
 * than the application — a nonsensical pair says more about data entry than
 * about the job search.
 */
export function averageDaysToInterview(jobs, interviews) {
  const jobById = new Map(jobs.map((j) => [j.id, j]))
  const gaps = []

  // Earliest interview per job, so several rounds don't skew the average.
  const earliest = new Map()

  for (const interview of interviews) {
    if (!interview.job_id || !interview.scheduled_at) continue

    const at = toDate(interview.scheduled_at)
    if (!at) continue

    const current = earliest.get(interview.job_id)
    if (!current || at < current) earliest.set(interview.job_id, at)
  }

  for (const [jobId, interviewDate] of earliest) {
    const job = jobById.get(jobId)
    const appliedDate = toDate(job?.application_date || job?.created_at)
    if (!appliedDate) continue

    const days = (interviewDate - appliedDate) / DAY
    if (days >= 0) gaps.push(days)
  }

  if (!gaps.length) return null

  return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length)
}

/** Median days an application has been open without reaching a conclusion. */
export function openApplications(jobs) {
  const open = appliedJobs(jobs).filter((j) => !CLOSED.includes(j.status))

  const ages = open
    .map((j) => toDate(j.application_date || j.created_at))
    .filter(Boolean)
    .map((d) => Math.floor((Date.now() - d.getTime()) / DAY))
    .sort((a, b) => a - b)

  const median = ages.length
    ? ages.length % 2
      ? ages[(ages.length - 1) / 2]
      : Math.round((ages[ages.length / 2 - 1] + ages[ages.length / 2]) / 2)
    : null

  return { count: open.length, medianAgeDays: median }
}
