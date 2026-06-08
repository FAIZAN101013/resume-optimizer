import { useState } from 'react'
import { X, Briefcase, Calendar, Mail, Users, FileText, Sparkles, Copy, Check } from 'lucide-react'
import Button from '../Button'
 
const TABS = [
  { key: "overview", label: "Overview" },
  { key: "jd",       label: "Job description" },
  { key: "email",    label: "AI email" },
]
 
const STATUS_BADGE = {
  Applied:   'text-violet-400 bg-violet-500/10 border-violet-500/20',
  Interview: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Offer:     'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Rejected:  'text-rose-400 bg-rose-500/10 border-rose-500/20',
}
 
const EMAIL_TYPES = [
  { key: 'followup',  label: 'Follow-up' },
  { key: 'thankyou',  label: 'Thank you' },
  { key: 'withdrawn', label: 'Withdraw' },
]
 
// ── calls your Vercel API route → Gemini (no API key exposed in browser) ──
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
      <div className="w-full max-w-[500px] max-h-[90vh] flex flex-col bg-[#13131c] border border-white/[0.09] rounded-2xl shadow-2xl overflow-hidden">
 
        {/* ── Header ── */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-base font-bold text-gray-300 shrink-0">
              {job.company[0]}
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{job.company}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{job.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${STATUS_BADGE[job.status]}`}>
              {job.status}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-colors flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
 
        {/* ── Tab bar ── */}
        <div className="flex gap-1 px-6 pt-3 pb-0 border-b border-white/[0.06] shrink-0">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-2 text-sm transition-all border-b-2 -mb-px ${
                tab === key
                  ? 'border-violet-500 text-violet-300'
                  : 'border-transparent text-white/35 hover:text-white/60'
              }`}
            >
              {label}
              {key === 'email' && (
                <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400">AI</span>
              )}
            </button>
          ))}
        </div>
 
        {/* ── Tab content ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
 
          {/* Overview */}
          {tab === "overview" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Detail icon={Calendar}  label="Applied on"      value={job.date || '—'} />
                <Detail icon={Mail}      label="Recruiter email" value={job.companyEmail || '—'} />
                <Detail icon={Users}     label="Referral"        value={job.isReferral ? job.referralEmail || 'Yes' : 'No'} />
                <Detail icon={Briefcase} label="Status"          value={job.status} />
              </div>
              {job.notes && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-600 uppercase tracking-widest font-medium mb-2">
                    <FileText className="w-3 h-3" /> Notes
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5">
                    {job.notes}
                  </p>
                </div>
              )}
            </>
          )}
 
          {/* Job description */}
          {tab === "jd" && (
            job.jobDescription ? (
              <div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-600 uppercase tracking-widest font-medium mb-3">
                  <FileText className="w-3 h-3" /> Job description
                </div>
                <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-wrap bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5">
                  {job.jobDescription}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white/20" />
                </div>
                <p className="text-sm text-white/30">No job description saved</p>
                <p className="text-xs text-white/20">Edit this application to paste one in — it improves AI email quality.</p>
                <button
                  onClick={onEdit}
                  className="mt-1 text-xs text-violet-400 border border-violet-500/30 px-3 py-1.5 rounded-lg hover:bg-violet-500/10 transition-colors"
                >
                  Add job description →
                </button>
              </div>
            )
          )}
 
          {/* AI Email */}
          {tab === "email" && (
            <div className="space-y-4 scrollbar-none overflow-y-auto">
              <div>
                <p className="text-[11px] font-medium text-white/35 tracking-widest uppercase mb-2">Email type</p>
                <div className="flex gap-2">
                  {EMAIL_TYPES.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => { setType(key); setDraft(''); setError('') }}
                      className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                        emailType === key
                          ? 'bg-violet-500/15 border-violet-500/40 text-violet-300'
                          : 'border-white/[0.08] text-white/35 hover:text-white/55 hover:border-white/20'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
 
              <p className="text-xs text-white/25">
                {job.jobDescription
                  ? '✓ JD detected — email will be personalised to the role.'
                  : 'No JD — email uses company & role name only. Add one via the Job description tab for better results.'}
              </p>
 
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-2.5 rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-300
                           text-sm font-medium hover:bg-violet-500/15 hover:border-violet-500/50
                           transition-all disabled:opacity-50 flex items-center justify-center gap-2
                           "
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
 
              {/* Error state */}
              {error && (
                <div className="px-3 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                  {error}
                </div>
              )}
 
              {/* Draft output */}
              {draft && (
                <div className="space-y-2">
                  {isFallback && (
                    <p className="text-[11px] text-amber-400/70 flex items-center gap-1.5">
                      <span>⚠</span> AI unavailable — showing a template. Edit freely before sending.
                    </p>
                  )}
                  <div className="relative">
                    <textarea
                      className="w-full px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08]
                                 text-sm text-gray-300 leading-relaxed resize-none focus:outline-none
                                 focus:border-white/20 transition-colors scrollbar-none overflow-y-auto"
                      rows={9}
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                    />
                    <button
                      onClick={handleCopy}
                      className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-md
                                 bg-white/[0.07] border border-white/[0.1] text-xs text-white/50
                                 hover:text-white/80 hover:border-white/20 transition-colors"
                    >
                      {copied
                        ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</>
                        : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
 
        {/* ── Footer ── */}
        <div className="flex gap-2 justify-end px-6 py-4 border-t border-white/[0.06] shrink-0">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={onEdit}>Edit application</Button>
        </div>
 
      </div>
    </div>
  )
}
 
function Detail({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] text-gray-600 uppercase tracking-widest font-medium mb-1">
        <Icon className="w-3 h-3" strokeWidth={1.75} /> {label}
      </div>
      <div className="text-sm text-gray-300 truncate">{value}</div>
    </div>
  )
}