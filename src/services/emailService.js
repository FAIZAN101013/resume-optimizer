import { supabase } from '../lib/supabase'

async function requireUserId() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('You must be signed in to do that.')
  return user.id
}

const SELECT = '*, job:jobs(id, company, title)'

export async function listEmails(limit = 50) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('ai_emails')
    .select(SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function saveEmail({ jobId, emailType, recipient, subject, content }) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('ai_emails')
    .insert({
      user_id: userId,
      job_id: jobId || null,
      email_type: emailType,
      recipient: recipient || null,
      subject: subject || null,
      content,
    })
    .select(SELECT)
    .single()

  if (error) throw error
  return data
}

export async function updateEmail(id, updates) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('ai_emails')
    .update({
      subject: updates.subject,
      content: updates.content,
      recipient: updates.recipient,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select(SELECT)
    .single()

  if (error) throw error
  return data
}

export async function deleteEmail(id) {
  const userId = await requireUserId()

  const { error } = await supabase
    .from('ai_emails')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}
