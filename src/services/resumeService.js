import { supabase } from '../lib/supabase'

const WRITABLE = [
  'name', 'target_role', 'target_job_description', 'source_job_id',
  'content', 'raw_text', 'file_url', 'file_name', 'file_type',
  'ai_score', 'is_default',
]

function toRow(form) {
  const row = {}
  for (const key of WRITABLE) {
    if (form[key] !== undefined) row[key] = form[key]
  }
  return row
}

async function requireUserId() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  if (!user) throw new Error('You must be signed in to do that.')
  return user.id
}

/* ------------------------------------------------------------------ resumes */

export async function listResumes() {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function createResume(form) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('resumes')
    .insert({ ...toRow(form), user_id: userId })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateResume(id, form) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('resumes')
    .update(toRow(form))
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteResume(id) {
  const userId = await requireUserId()

  const { error } = await supabase
    .from('resumes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) throw error
}

// Copies everything except identity and timestamps, so an experiment never
// risks the version the user already trusts.
export async function duplicateResume(resume) {
  return createResume({
    name: `${resume.name} (copy)`,
    target_role: resume.target_role,
    target_job_description: resume.target_job_description,
    source_job_id: resume.source_job_id,
    content: resume.content,
    raw_text: resume.raw_text,
    file_url: resume.file_url,
    file_name: resume.file_name,
    file_type: resume.file_type,
    ai_score: resume.ai_score,
    is_default: false,
  })
}

/* ------------------------------------------------------------------ storage */

const MAX_BYTES = 3 * 1024 * 1024
const ACCEPTED = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
}

export function validateResumeFile(file) {
  if (!ACCEPTED[file.type]) {
    if (file.type === 'application/msword') {
      throw new Error('Legacy .doc files are not supported. Save as .docx or PDF.')
    }
    throw new Error('Please choose a PDF or DOCX file.')
  }

  if (file.size > MAX_BYTES) {
    throw new Error('That file is larger than 3 MB.')
  }

  if (file.size === 0) {
    throw new Error('That file is empty.')
  }
}

// The uploaded file is kept verbatim so the original is never lost, however
// much the parsed sections are edited afterwards.
export async function uploadResumeFile(file) {
  const userId = await requireUserId()
  validateResumeFile(file)

  const extension = ACCEPTED[file.type]
  const safeName = file.name.replace(/[^\w.-]+/g, '_').slice(0, 60)
  const path = `${userId}/${Date.now()}-${safeName || `resume.${extension}`}`

  const { error } = await supabase.storage
    .from('resumes')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) throw error

  return { path, fileName: file.name, fileType: file.type }
}

// The bucket is private, so downloads go through a short-lived signed URL.
export async function getResumeDownloadUrl(path, expiresInSeconds = 300) {
  const { data, error } = await supabase.storage
    .from('resumes')
    .createSignedUrl(path, expiresInSeconds)

  if (error) throw error
  return data.signedUrl
}

export async function removeResumeFile(path) {
  if (!path) return
  const { error } = await supabase.storage.from('resumes').remove([path])
  if (error) throw error
}

/* ----------------------------------------------------------------- analyses */

export async function listAnalyses(resumeId) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('resume_analyses')
    .select('*')
    .eq('resume_id', resumeId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function saveAnalysis({ resumeId, jobId, jobDescription, analysis }) {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('resume_analyses')
    .insert({
      resume_id: resumeId,
      user_id: userId,
      job_id: jobId || null,
      job_description: jobDescription,
      overall_score: analysis.overall_score,
      ats_score: analysis.ats_score,
      score_reasoning: analysis.score_reasoning,
      matched_keywords: analysis.matched_keywords,
      missing_keywords: analysis.missing_keywords,
      recommended_keywords: analysis.recommended_keywords,
      missing_skills: analysis.missing_skills,
      suggestions: analysis.suggestions,
      breakdown: analysis.breakdown,
    })
    .select()
    .single()

  if (error) throw error
  return data
}
