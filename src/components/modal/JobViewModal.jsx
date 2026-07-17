import { useState } from 'react'
import { X, Briefcase, Calendar, Mail, Users, FileText, Sparkles, Copy, Check } from 'lucide-react'
import Button from '../Button'
import { STATUS_BADGE, EMAIL_TYPES } from '../../lib/constants'

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "jd",       label: "Job description" },
  { key: "email",    label: "AI email" },
]

async function generateEmail({ type, job }) {
  const res = await fetch("/api/generate-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, job }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to generate email")
  }

  const data = await res.json()
  return { email: data.email ?? "", isFallback: data.isFallback ?? false }
}

export default function JobViewModal({ job, onClose, onEdit }) {
  const [tab, setTab]         = useState("overview")
  const [emailType, setType]  = useState('followup')
  const [draft, setDraft]           = useState('')
  const [loading, setLoading]       = useState(false)
  const [copied, setCopied]         = useState(false)
  const [error, setError]           = useState('')
  const [isFallback, setIsFallback] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setDraft('')
    setError('')
    setIsFallback(false)
    try {
      const result = await generateEmail({ type: emailType, job })
      setDraft(result.email)
      setIsFallback(result.isFallback)
    } catch (err) {
      setError(err.message || 'Something went wrong — please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[500px] max-h-[90vh] flex flex-col bg-white dark:bg-[#13131c] border border-gray-200 dark:border-white/[0.09] rounded-2xl shadow-2xl overflow-hidden text-gray-900 dark:text-white">

        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-200 dark:border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-base font-bold text-gray-700 dark:text-gray-300 shrink-0">
              {(job.company || '?')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{job.company}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{job.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${STATUS_BADGE[job.status]}`}>
              {job.status}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/80 hover:border-gray-300 dark:hover:border-white/20 transition-colors flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex gap-1 px-6 pt-3 pb-0 border-b border-gray-200 dark:border-white/[0.06] shrink-0">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-2 text-sm transition-all border-b-2 -mb-px ${
                tab === key
                  ? 'border-violet-500 text-violet-700 dark:text-violet-300'
                  : 'border-transparent text-gray-500 dark:text-white/35 hover:text-gray-700 dark:hover:text-white/60'
              }`}
            >
              {label}
              {key === 'email' && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-400">AI</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-none">

          {tab === "overview" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Detail icon={Calendar}  label="Applied on"      value={job.application_date || '—'} />
                <Detail icon={Mail}      label="Recruiter email" value={job.recruiter_email || job.company_email || '—'} />
                <Detail icon={Users}     label="Referral"        value={job.is_referral ? job.referral_email || 'Yes' : 'No'} />
                <Detail icon={Briefcase} label="Status"          value={job.status} />
              </div>
              {job.notes && (
                <div className="pt-2 border-t border-gray-200 dark:border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-600 uppercase tracking-widest font-medium mb-2">
                    <FileText className="w-3 h-3" /> Notes
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-lg px-3 py-2.5">
                    {job.notes}
                  </p>
                </div>
              )}
            </>
          )}

          {tab === "jd" && (
            job.description ? (
              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-600 uppercase tracking-widest font-medium mb-3">
                  <FileText className="w-3 h-3" /> Job description
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-lg px-3 py-2.5">
                  {job.description}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.06] flex items-center justify-center">
                  <FileText className="w-4 h-4 text-gray-400 dark:text-white/20" />
                </div>
                <p className="text-sm text-gray-500 dark:text-white/30">No job description saved</p>
                <p className="text-xs text-gray-400 dark:text-white/20">Edit this application to paste one in — it improves AI email quality.</p>
                <button
                  onClick={onEdit}
                  className="mt-1 text-xs text-violet-600 dark:text-violet-400 border border-violet-500/30 px-3 py-1.5 rounded-lg hover:bg-violet-500/10 transition-colors"
                >
                  Add job description →
                </button>
              </div>
            )
          )}

          {tab === "email" && (
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-medium text-gray-500 dark:text-white/35 tracking-widest uppercase mb-2">Email type</p>
                <div className="grid grid-cols-3 gap-2">
                  {EMAIL_TYPES.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => { setType(key); setDraft(''); setError('') }}
                      className={`py-2 px-1 rounded-lg border text-[11px] font-medium leading-tight transition-all ${
                        emailType === key
                          ? 'bg-violet-500/15 border-violet-500/40 text-violet-700 dark:text-violet-300'
                          : 'border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-white/35 hover:text-gray-700 dark:hover:text-white/55 hover:border-gray-300 dark:hover:border-white/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-400 dark:text-white/25">
                {job.description
                  ? '✓ JD detected — email will be personalised to the role.'
                  : 'No JD — email uses company & role name only. Add one via the Job description tab for better results.'}
              </p>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-2.5 rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300 text-sm font-medium hover:bg-violet-500/15 hover:border-violet-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border border-violet-400/40 border-t-violet-400 rounded-full animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate {EMAIL_TYPES.find(t => t.key === emailType)?.label} email
                  </>
                )}
              </button>

              {error && (
                <div className="px-3 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                  {error}
                </div>
              )}

              {draft && (
                <div className="space-y-2">
                  {isFallback && (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400/70 flex items-center gap-1.5">
                      <span>⚠</span> AI unavailable — showing a template. Edit freely before sending.
                    </p>
                  )}
                  <div className="relative">
                    <textarea
                      className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-700 dark:text-gray-300 leading-relaxed resize-none focus:outline-none focus:border-violet-400 dark:focus:border-white/20 transition-colors scrollbar-none overflow-y-auto"
                      rows={9}
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                    />
                    <button
                      onClick={handleCopy}
                      className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-white/[0.07] border border-gray-200 dark:border-white/[0.1] text-xs text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/80 hover:border-gray-300 dark:hover:border-white/20 transition-colors shadow-sm"
                    >
                      {copied
                        ? <><Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Copied</>
                        : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end px-6 py-4 border-t border-gray-200 dark:border-white/[0.06] shrink-0">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={onEdit}>Edit application</Button>
        </div>

      </div>
    </div>
  )
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.06] rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-gray-600 uppercase tracking-widest font-medium mb-1">
        <Icon className="w-3 h-3" strokeWidth={1.75} /> {label}
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300 truncate">{value}</div>
    </div>
  )
}
