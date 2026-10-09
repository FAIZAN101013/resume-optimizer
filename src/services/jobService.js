import { supabase } from '../lib/supabase'

// Columns the client is allowed to write. Anything else on the form object
// (UI-only state, ids, joined rows) is dropped before it reaches Postgres.
const WRITABLE = [
  'company', 'title', 'url', 'location', 'work_type', 'salary', 'description',
  'status', 'application_date', 'notes', 'recruiter_name', 'recruiter_email',
  'source', 'priority', 'company_email', 'is_referral', 'referral_email',
]

// Empty date strings are not valid dates — Postgres rejects ''.
const DATE_FIELDS = ['application_date']

function toRow(form) {
  const row = {}

  for (const key of WRITABLE) {
    if (form[key] === undefined) continue

    let value = form[key]
    if (typeof value === 'string') value = value.trim()
    if (value === '' && DATE_FIELDS.includes(key)) value = null

    row[key] = value
  }

  return row
}

async function requireUserId() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('You must be signed in to do that.')
  return user.id
}

export async function listJobs() {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getJob(id) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function createJob(form) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('jobs')
    .insert({ ...toRow(form), user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateJob(id, form) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('jobs')
    .update(toRow(form))
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteJob(id) {
  const userId = await requireUserId()

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}

// The timeline. Rows are written by database triggers on insert/status-change,
// so this is read-mostly; addActivity is for events the DB can't see
// (resume optimized, email generated, interview scheduled).
export async function listJobActivities(jobId) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('job_activities')
    .select('*')
    .eq('job_id', jobId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

// Recent activity across every application, for the dashboard feed.
export async function listRecentActivities(limit = 8) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('job_activities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function addActivity(jobId, activityType, description, metadata = {}) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('job_activities')
    .insert({
      job_id: jobId,
      user_id: userId,
      activity_type: activityType,
      description,
      metadata,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
