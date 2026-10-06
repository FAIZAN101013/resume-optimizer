import { useCallback, useEffect, useState } from 'react'
import {
  Sparkles,
  Copy,
  Check,
  Save,
  Trash2,
  AlertCircle,
  Mail,
  RotateCcw,
} from 'lucide-react'

import Button from '../components/Button'
import ThemeToggle from '../components/ThemeToggle'
import Card from '../components/common/Card'
import Tabs from '../components/common/Tabs'
import ConfirmDialog from '../components/common/ConfirmDialog'
import { Input, Select, Textarea, fieldClasses } from '../components/common/Field'

import { EMAIL_TYPES } from '../lib/constants'
import { listJobs, addActivity } from '../services/jobService'
import { listEmails, saveEmail, deleteEmail } from '../services/emailService'
import { generateEmail } from '../services/aiService'
import { useProfile } from '../context/ProfileContext'

export default function Assistant() {
  const { profile } = useProfile()

  const [tab, setTab] = useState('compose')
  const [jobs, setJobs] = useState([])
  const [saved, setSaved] = useState([])

  const [emailType, setEmailType] = useState('followup')
  const [jobId, setJobId] = useState('')
  const [recipient, setRecipient] = useState('')
  const [subject, setSubject] = useState('')
  const [extraNotes, setExtraNotes] = useState('')
  const [draft, setDraft] = useState('')

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [isFallback, setIsFallback] = useState(false)
  const [fallbackReason, setFallbackReason] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

  const load = useCallback(async () => {
    try {
      const [jobList, emailList] = await Promise.all([listJobs(), listEmails()])
      setJobs(jobList)
      setSaved(emailList)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not load your data.')
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const selectedJob = jobs.find((j) => j.id === jobId)
  const typeLabel = EMAIL_TYPES.find((t) => t.key === emailType)?.label

  function handleJobChange(id) {
    setJobId(id)
    const job = jobs.find((j) => j.id === id)
    // Prefill the recipient from whatever contact the tracker already has.
    if (job && !recipient) {
      setRecipient(job.recruiter_email || job.company_email || '')
    }
  }

  async function handleGenerate() {
    setLoading(true)
    setError('')
    setNotice('')
    setIsFallback(false)

    try {
      const result = await generateEmail({
        type: emailType,
        job: selectedJob || { company: '', title: '' },
        extra: {
          senderName: profile?.full_name,
          notes: extraNotes,
        },
      })

      setDraft(result.email)
      setIsFallback(result.isFallback)
      setFallbackReason(result.fallbackReason || '')

      if (!subject && selectedJob) {
        setSubject(`${typeLabel} — ${selectedJob.title} at ${selectedJob.company}`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const row = await saveEmail({
        jobId: jobId || null,
        emailType,
        recipient,
        subject,
        content: draft,
      })

      setSaved((prev) => [row, ...prev])
      setNotice('Saved to your email history.')

      if (jobId) {
        await addActivity(
          jobId,
          'email_generated',
          `${typeLabel} email drafted`,
          { email_type: emailType },
        ).catch(() => {})
      }
    } catch (err) {
      setError(err.message || 'Could not save that email.')
    } finally {
      setSaving(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    if (!pendingDelete) return
    try {
      await deleteEmail(pendingDelete.id)
      setSaved((prev) => prev.filter((e) => e.id !== pendingDelete.id))
      setPendingDelete(null)
    } catch (err) {
      setError(err.message || 'Could not delete that email.')
    }
  }

  function loadSaved(email) {
    setEmailType(email.email_type)
    setJobId(email.job_id || '')
    setRecipient(email.recipient || '')
    setSubject(email.subject || '')
    setDraft(email.content || '')
    setTab('compose')
    setNotice('Loaded from history — edit and re-save as needed.')
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Professional career emails, grounded in your applications
          </p>
        </div>
        <ThemeToggle />
      </div>

      <Tabs
        tabs={[
          { key: 'compose', label: 'Compose' },
          { key: 'history', label: 'History', badge: saved.length },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-6"
      />

      {error && (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-700 dark:text-rose-300">
          <span className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </span>
          <button onClick={() => setError('')} aria-label="Dismiss" className="leading-none">×</button>
        </div>
      )}

      {notice && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-300">
          <Check className="h-3.5 w-3.5 shrink-0" />
          {notice}
        </div>
      )}

      {tab === 'compose' && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          <Card title="What to write" subtitle="Pick a type and give it context">
            <div className="space-y-4">
              <div>
                <p className="mb-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
                  Email type
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {EMAIL_TYPES.map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { setEmailType(key); setDraft(''); setError('') }}
                      className={`rounded-lg border px-2 py-2 text-[11px] font-medium leading-tight transition-all ${
                        emailType === key
                          ? 'border-violet-500/40 bg-violet-500/15 text-violet-700 dark:text-violet-300'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:border-white/[0.08] dark:text-white/35 dark:hover:text-white/55'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Select
                label="Application"
                hint={jobs.length ? 'Optional' : 'No tracked jobs yet'}
                name="job"
                value={jobId}
                onChange={(e) => handleJobChange(e.target.value)}
              >
                <option value="">Not linked to an application</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} — {job.company}
                  </option>
                ))}
              </Select>

              <Input
                label="Recipient"
                hint="Optional"
                name="recipient"
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="recruiter@company.com"
              />

              <Textarea
                label="Anything to mention"
                hint="Optional"
                name="extra"
                rows={3}
                value={extraNotes}
                onChange={(e) => setExtraNotes(e.target.value)}
                placeholder="A detail from the interview, your availability, a deadline…"
              />

              <Button onClick={handleGenerate} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Writing…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    {draft ? 'Regenerate' : 'Generate'} {typeLabel?.toLowerCase()}
                  </>
                )}
              </Button>

              {!selectedJob && (
                <p className="text-[11px] leading-relaxed text-gray-400 dark:text-white/25">
                  Linking an application lets the email reference the real role,
                  company and job description.
                </p>
              )}
            </div>
          </Card>

          <Card
            title="Draft"
            subtitle="Fully editable before you send it"
            action={
              draft && (
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition-colors hover:text-gray-900 dark:border-white/[0.08] dark:text-gray-400 dark:hover:text-white"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading}
                    aria-label="Regenerate"
                    className="rounded-lg border border-gray-200 p-1.5 text-gray-600 transition-colors hover:text-gray-900 disabled:opacity-50 dark:border-white/[0.08] dark:text-gray-400 dark:hover:text-white"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                </div>
              )
            }
          >
            {isFallback && (
              <p className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-700 dark:text-amber-300">
                ⚠ This is a template, not an AI draft. {fallbackReason}
              </p>
            )}

            <Input
              className="mb-3"
              label="Subject"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Following up on my application"
            />

            <textarea
              rows={14}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Your generated email appears here, ready to edit…"
              className={`${fieldClasses} resize-none leading-relaxed scrollbar-none`}
            />

            <Button
              variant="secondary"
              onClick={handleSave}
              disabled={!draft.trim() || saving}
              className="mt-3 w-full"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Saving…' : 'Save to history'}
            </Button>
          </Card>
        </div>
      )}

      {tab === 'history' && (
        <Card title="Saved emails" subtitle={`${saved.length} draft${saved.length === 1 ? '' : 's'}`}>
          {saved.length === 0 ? (
            <div className="py-12 text-center">
              <Mail className="mx-auto mb-3 h-7 w-7 opacity-30" strokeWidth={1.5} />
              <p className="text-sm text-gray-500 dark:text-gray-600">Nothing saved yet.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {saved.map((email) => (
                <li
                  key={email.id}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => loadSaved(email)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {email.subject || EMAIL_TYPES.find((t) => t.key === email.email_type)?.label}
                        </span>
                        <span className="shrink-0 rounded-full border border-violet-500/20 bg-violet-500/10 px-1.5 py-0.5 text-[10px] text-violet-700 dark:text-violet-300">
                          {EMAIL_TYPES.find((t) => t.key === email.email_type)?.label}
                        </span>
                      </div>

                      <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-white/30">
                        {email.job ? `${email.job.title} at ${email.job.company} · ` : ''}
                        {new Date(email.created_at).toLocaleDateString()}
                      </p>

                      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-white/35">
                        {email.content}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPendingDelete(email)}
                      aria-label="Delete email"
                      className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:text-white/25 dark:hover:text-rose-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this email?"
          message="This saved draft will be removed. This can't be undone."
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  )
}
