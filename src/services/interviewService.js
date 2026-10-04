import { supabase } from '../lib/supabase'

const WRITABLE = [
  'job_id', 'company', 'position', 'interview_type', 'scheduled_at',
  'duration_minutes', 'interviewer', 'meeting_url', 'notes', 'prep_notes',
  'prep_material', 'status',
]

function toRow(form) {
  const row = {}
  for (const key of WRITABLE) {
    if (form[key] === undefined) continue

    let value = form[key]
    if (typeof value === 'string') value = value.trim()
    // Empty strings are not valid timestamps or uuids.
    if (value === '' && (key === 'scheduled_at' || key === 'job_id')) value = null

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

// Joins the job so cards can show company/title even when the interview row
// was created from a tracked application rather than typed in by hand.
const SELECT = '*, job:jobs(id, company, title, description, status)'

export async function listInterviews() {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('interviews')
    .select(SELECT)
    .eq('user_id', userId)
    .order('scheduled_at', { ascending: true, nullsFirst: false })

  if (error) throw error
  return data ?? []
}

export async function listUpcomingInterviews(limit = 5) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('interviews')
    .select(SELECT)
    .eq('user_id', userId)
    .eq('status', 'Scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function createInterview(form) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('interviews')
    .insert({ ...toRow(form), user_id: userId })
    .select(SELECT)
    .single()

  if (error) throw error
  return data
}

export async function updateInterview(id, form) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('interviews')
    .update(toRow(form))
    .eq('id', id)
    .eq('user_id', userId)
    .select(SELECT)
    .single()

  if (error) throw error
  return data
}

export async function deleteInterview(id) {
  const userId = await requireUserId()

  const { error } = await supabase
    .from('interviews')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}
