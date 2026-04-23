import { useState } from "react"
import Button from "./../Button"

const STATUS_OPTIONS = [
  { key: "Applied",   active: "bg-blue-500/15 border-blue-500/50 text-blue-400" },
  { key: "Interview", active: "bg-yellow-500/10 border-yellow-400/45 text-yellow-300" },
  { key: "Offer",     active: "bg-green-500/10 border-green-400/45 text-green-400" },
  { key: "Rejected",  active: "bg-red-500/10 border-red-400/45 text-red-400" },
]

const INITIAL_FORM = {
  company: "",
  role: "",
  status: "Applied",
  date: "",
  companyEmail: "",
  isReferral: false,
  referralEmail: "",
  notes: "",
}

export default function JobAddModal({ onAdd, onClose }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})

  const set = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: false }))
  }

  const validate = () => {
    const next = {}
    if (!form.company.trim()) next.company = true
    if (!form.role.trim())    next.role    = true
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
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
      <div className="w-full max-w-[460px] bg-[#13131c] border border-white/[0.09] rounded-2xl p-6 space-y-4 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-medium tracking-tight">Add application</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-white/10 text-white/50 hover:text-white/80
                       hover:border-white/20 transition-colors text-lg leading-none flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Position */}
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
        </Section>

        <Divider />

        {/* Status */}
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

        {/* Referral */}
        <Section label="Referral">
          <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03]
                            border border-white/[0.08] cursor-pointer hover:bg-white/[0.05] transition-colors">
            <input
              type="checkbox"
              className="w-4 h-4 accent-indigo-500 cursor-pointer"
              checked={form.isReferral}
              onChange={e => set("isReferral", e.target.checked)}
            />
            <span className="text-sm text-white/50">This application came through a referral</span>
          </label>
          {form.isReferral && (
            <div className="mt-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
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

        <Divider />

        {/* Notes */}
        <Section label="Notes">
          <textarea
            placeholder="Any extra context, links, or reminders…"
            rows={3}
            className={fieldCls() + " resize-none leading-relaxed"}
            value={form.notes}
            onChange={e => set("notes", e.target.value)}
          />
        </Section>

        {/* Footer */}
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Add application
          </Button>
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
  return <hr className="border-none border-t border-white/[0.07]" />
}