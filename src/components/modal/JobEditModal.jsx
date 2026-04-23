import { useState } from 'react'
import Button from '../Button'

const STATUS_OPTIONS = [
  { key: 'Applied',   active: 'bg-violet-500/15 border-violet-500/50 text-violet-400' },
  { key: 'Interview', active: 'bg-amber-500/10 border-amber-400/45 text-amber-300' },
  { key: 'Offer',     active: 'bg-emerald-500/10 border-emerald-400/45 text-emerald-400' },
  { key: 'Rejected',  active: 'bg-rose-500/10 border-rose-400/45 text-rose-400' },
]

export default function JobEditModal({ job, onSave, onClose }) {
  // Pre-fill form with existing job data
  const [form, setForm] = useState({ ...job })

  const set = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const handleSave = () => {
    if (!form.company.trim() || !form.role.trim()) return
    onSave(form)
    onClose()
  }

  const fieldCls =
    "w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white " +
    "placeholder-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-colors"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[460px] bg-[#13131c] border border-white/[0.09] rounded-2xl p-6 space-y-4 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-medium tracking-tight">Edit application</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-colors flex items-center justify-center"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        {/* Position */}
        <Section label="Position">
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="text"
              placeholder="Company"
              className={fieldCls}
              value={form.company}
              onChange={e => set('company', e.target.value)}
            />
            <input
              type="text"
              placeholder="Role / title"
              className={fieldCls}
              value={form.role}
              onChange={e => set('role', e.target.value)}
            />
            <input
              type="date"
              className={fieldCls}
              value={form.date}
              onChange={e => set('date', e.target.value)}
            />
            <input
              type="email"
              placeholder="Recruiter email"
              className={fieldCls}
              value={form.companyEmail || ''}
              onChange={e => set('companyEmail', e.target.value)}
            />
          </div>
        </Section>

        <hr className="border-white/[0.07]" />

        {/* Status */}
        <Section label="Status">
          <div className="grid grid-cols-4 gap-2">
            {STATUS_OPTIONS.map(({ key, active }) => (
              <button
                key={key}
                onClick={() => set('status', key)}
                className={`py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  form.status === key
                    ? active
                    : 'border-white/[0.08] text-white/40 hover:text-white/60 hover:border-white/20'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </Section>

        <hr className="border-white/[0.07]" />

        {/* Referral */}
        <Section label="Referral">
          <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] cursor-pointer hover:bg-white/[0.05] transition-colors">
            <input
              type="checkbox"
              className="w-4 h-4 accent-violet-500 cursor-pointer"
              checked={form.isReferral || false}
              onChange={e => set('isReferral', e.target.checked)}
            />
            <span className="text-sm text-white/50">This application came through a referral</span>
          </label>
          {form.isReferral && (
            <input
              type="email"
              placeholder="Referral contact email"
              className={`${fieldCls} mt-2.5`}
              value={form.referralEmail || ''}
              onChange={e => set('referralEmail', e.target.value)}
            />
          )}
        </Section>

        <hr className="border-white/[0.07]" />

        {/* Notes */}
        <Section label="Notes">
          <textarea
            placeholder="Any extra context, links, or reminders…"
            rows={3}
            className={`${fieldCls} resize-none leading-relaxed`}
            value={form.notes || ''}
            onChange={e => set('notes', e.target.value)}
          />
        </Section>

        {/* Footer */}
        <div className="flex gap-2 justify-end pt-1">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
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