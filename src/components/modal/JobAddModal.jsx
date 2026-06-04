import { useState } from "react"
import Button from "./../Button"

const TABS = [
  { key: "basic",   label: "Basic" },
  { key: "details", label: "Details" },
  { key: "notes",   label: "Notes" },
]

const STATUS_OPTIONS = [
  { key: "Applied",   active: "bg-violet-500/15 border-violet-500/50 text-violet-400" },
  { key: "Interview", active: "bg-amber-500/10 border-amber-400/45 text-amber-300" },
  { key: "Offer",     active: "bg-emerald-500/10 border-emerald-400/45 text-emerald-400" },
  { key: "Rejected",  active: "bg-rose-500/10 border-rose-400/45 text-rose-400" },
]

const INITIAL_FORM = {
  company: "",
  role: "",
  status: "Applied",
  date: "",
  companyEmail: "",
  isReferral: false,
  referralEmail: "",
  jobDescription: "",
  notes: "",
}

export default function JobAddModal({ onAdd, onClose }) {
  const [tab, setTab]       = useState("basic")
  const [form, setForm]     = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})

  const tabIndex = TABS.findIndex(t => t.key === tab)
  const isFirst  = tabIndex === 0
  const isLast   = tabIndex === TABS.length - 1

  const set = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: false }))
  }

  const validateBasic = () => {
    const next = {}
    if (!form.company.trim()) next.company = true
    if (!form.role.trim())    next.role    = true
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleNext = () => {
    if (tab === "basic" && !validateBasic()) return
    setTab(TABS[tabIndex + 1].key)
  }

  const handleBack = () => setTab(TABS[tabIndex - 1].key)

  const handleSubmit = () => {
    if (!validateBasic()) { setTab("basic"); return }
    onAdd({ id: Date.now(), ...form, date: form.date || new Date().toLocaleDateString() })
    onClose()
  }

  const fieldBase =
    "w-full px-3 py-2 rounded-lg bg-white/[0.04] border text-sm text-white placeholder-white/30 " +
    "transition-colors focus:outline-none focus:bg-white/[0.06]"

  const fieldCls = (key) =>
    fieldBase + (errors[key]
      ? " border-red-500/60 focus:border-red-400"
      : " border-white/[0.08] focus:border-white/30")

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[460px] bg-[#13131c] border border-white/[0.09] rounded-2xl p-6 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[17px] font-medium tracking-tight">Add application</h2>
            <p className="text-[11px] text-white/25 mt-0.5">
              Step {tabIndex + 1} of {TABS.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-white/10 text-white/50 hover:text-white/80
                       hover:border-white/20 transition-colors text-lg leading-none flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-white/[0.07] pb-3 mb-5">
          {TABS.map(({ key, label }, i) => (
            <button
              key={key}
              onClick={() => {
                if (i > tabIndex && tab === "basic" && !validateBasic()) return
                setTab(key)
              }}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                tab === key
                  ? "bg-violet-600/20 text-violet-300"
                  : i < tabIndex
                  ? "text-white/50 hover:text-white/70"
                  : "text-white/25 hover:text-white/40"
              }`}
            >
              {i < tabIndex ? "✓ " : ""}{label}
            </button>
          ))}

          {/* progress pip */}
          <div className="ml-auto flex items-center gap-1 pr-1">
            {TABS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i <= tabIndex ? "w-5 bg-violet-500" : "w-2 bg-white/[0.1]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ── Tab: Basic ── */}
        {tab === "basic" && (
          <Section label="Position">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <input
                  type="text"
                  placeholder="Company"
                  className={fieldCls("company")}
                  value={form.company}
                  onChange={e => set("company", e.target.value)}
                />
                {errors.company && <p className="text-red-400 text-xs mt-1">Required</p>}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Role / title"
                  className={fieldCls("role")}
                  value={form.role}
                  onChange={e => set("role", e.target.value)}
                />
                {errors.role && <p className="text-red-400 text-xs mt-1">Required</p>}
              </div>
              <input
                type="date"
                className={fieldCls()}
                value={form.date}
                onChange={e => set("date", e.target.value)}
              />
              <input
                type="email"
                placeholder="Recruiter email"
                className={fieldCls()}
                value={form.companyEmail}
                onChange={e => set("companyEmail", e.target.value)}
              />
            </div>
            <div className="mt-2.5">
              <textarea
                placeholder="Paste the job description here (used for AI email drafts)…"
                rows={4}
                className={fieldCls() + " resize-none leading-relaxed"}
                value={form.jobDescription}
                onChange={e => set("jobDescription", e.target.value)}
              />
              <p className="text-[11px] text-white/20 mt-1">
                Optional — helps generate tailored follow-up emails
              </p>
            </div>
          </Section>
        )}

        {/* ── Tab: Details ── */}
        {tab === "details" && (
          <div className="space-y-4">
            <Section label="Status">
              <div className="grid grid-cols-4 gap-2">
                {STATUS_OPTIONS.map(({ key, active }) => (
                  <button
                    key={key}
                    onClick={() => set("status", key)}
                    className={
                      "py-1.5 rounded-lg border text-xs font-medium transition-all " +
                      (form.status === key
                        ? active
                        : "border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/20")
                    }
                  >
                    {key}
                  </button>
                ))}
              </div>
            </Section>

            <Divider />

            <Section label="Referral">
              <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03]
                                border border-white/[0.08] cursor-pointer hover:bg-white/[0.05] transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-violet-500 cursor-pointer"
                  checked={form.isReferral}
                  onChange={e => set("isReferral", e.target.checked)}
                />
                <span className="text-sm text-white/50">This application came through a referral</span>
              </label>
              {form.isReferral && (
                <div className="mt-2.5">
                  <input
                    type="email"
                    placeholder="Referral contact email"
                    className={fieldCls()}
                    value={form.referralEmail}
                    onChange={e => set("referralEmail", e.target.value)}
                  />
                </div>
              )}
            </Section>
          </div>
        )}

        {/* ── Tab: Notes ── */}
        {tab === "notes" && (
          <Section label="Notes">
            <textarea
              placeholder="Any extra context, links, or reminders…"
              rows={6}
              className={fieldCls() + " resize-none leading-relaxed"}
              value={form.notes}
              onChange={e => set("notes", e.target.value)}
            />
            <p className="text-[11px] text-white/20 mt-1">
              Optional — saved with your application for reference
            </p>
          </Section>
        )}

        {/* Footer */}
        <div className="flex gap-2 justify-between pt-5 mt-2 border-t border-white/[0.06]">
          <div>
            {!isFirst && (
              <Button variant="secondary" onClick={handleBack}>← Back</Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            {isLast
              ? <Button onClick={handleSubmit}>Add application</Button>
              : <Button onClick={handleNext}>Next →</Button>
            }
          </div>
        </div>

      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-white/35 tracking-widest uppercase mb-2">{label}</p>
      {children}
    </div>
  )
}

function Divider() {
  return <hr className="border-white/[0.07] my-1" />
}