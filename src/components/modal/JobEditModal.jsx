import { useState } from 'react'
import Button from '../Button'
import { JOB_STATUSES, STATUS_ACTIVE, STATUS_INACTIVE } from '../../lib/constants'

const TABS = [
  { key: "basic",   label: "Basic" },
  { key: "details", label: "Details" },
  { key: "notes",   label: "Notes" },
]

const STATUS_OPTIONS = JOB_STATUSES.map(key => ({ key, active: STATUS_ACTIVE[key] }))

export default function JobEditModal({ job, onSave, onClose }) {
  const [tab, setTab]   = useState("basic")
  const [form, setForm] = useState({ ...job })

  const tabIndex = TABS.findIndex(t => t.key === tab)
  const isFirst  = tabIndex === 0
  const isLast   = tabIndex === TABS.length - 1

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleNext = () => setTab(TABS[tabIndex + 1].key)
  const handleBack = () => setTab(TABS[tabIndex - 1].key)

  const handleSave = () => {
    if (!form.company?.trim() || !form.title?.trim()) { setTab("basic"); return }
    onSave(form)
    onClose()
  }

  const fieldCls =
    "w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-violet-400 dark:focus:border-white/30 focus:bg-white dark:focus:bg-white/[0.06] transition-colors"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[460px] bg-white dark:bg-[#13131c] border border-gray-200 dark:border-white/[0.09] rounded-2xl p-6 shadow-2xl text-gray-900 dark:text-white">

        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[17px] font-medium tracking-tight">Edit application</h2>
            <p className="text-[11px] text-gray-400 dark:text-white/25 mt-0.5">
              Step {tabIndex + 1} of {TABS.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/80 hover:border-gray-300 dark:hover:border-white/20 transition-colors flex items-center justify-center"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        <div className="flex gap-1 border-b border-gray-200 dark:border-white/[0.07] pb-3 mb-5">
          {TABS.map(({ key, label }, i) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                tab === key
                  ? "bg-violet-600/20 text-violet-700 dark:text-violet-300"
                  : i < tabIndex
                  ? "text-gray-600 dark:text-white/50 hover:text-gray-800 dark:hover:text-white/70"
                  : "text-gray-400 dark:text-white/25 hover:text-gray-600 dark:hover:text-white/40"
              }`}
            >
              {i < tabIndex ? "✓ " : ""}{label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1 pr-1">
            {TABS.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i <= tabIndex ? "w-5 bg-violet-500" : "w-2 bg-gray-200 dark:bg-white/[0.1]"
                }`}
              />
            ))}
          </div>
        </div>

        {tab === "basic" && (
          <Section label="Position">
            <div className="grid grid-cols-2 gap-2.5">
              <input
                type="text"
                placeholder="Company"
                className={fieldCls}
                value={form.company || ''}
                onChange={e => set('company', e.target.value)}
              />
              <input
                type="text"
                placeholder="Role / title"
                className={fieldCls}
                value={form.title || ''}
                onChange={e => set('title', e.target.value)}
              />
              <input
                type="date"
                className={fieldCls}
                value={form.application_date || ''}
                onChange={e => set('application_date', e.target.value)}
              />
              <input
                type="email"
                placeholder="Recruiter email"
                className={fieldCls}
                value={form.recruiter_email || ''}
                onChange={e => set('recruiter_email', e.target.value)}
              />
            </div>
            <div className="mt-2.5">
              <textarea
                placeholder="Paste the job description here…"
                rows={4}
                className={`${fieldCls} resize-none leading-relaxed`}
                value={form.description || ''}
                onChange={e => set('description', e.target.value)}
              />
              <p className="text-[11px] text-gray-400 dark:text-white/20 mt-1">
                Powers resume analysis, interview prep, and tailored emails
              </p>
            </div>
          </Section>
        )}

        {tab === "details" && (
          <div className="space-y-4">
            <Section label="Status">
              <div className="grid grid-cols-4 gap-2">
                {STATUS_OPTIONS.map(({ key, active }) => (
                  <button
                    key={key}
                    onClick={() => set('status', key)}
                    className={`py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                      form.status === key ? active : STATUS_INACTIVE
                    }`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </Section>

            <Divider />

            <Section label="Referral">
              <label className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] cursor-pointer hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-violet-500 cursor-pointer"
                  checked={form.is_referral || false}
                  onChange={e => set('is_referral', e.target.checked)}
                />
                <span className="text-sm text-gray-600 dark:text-white/50">This application came through a referral</span>
              </label>
              {form.is_referral && (
                <input
                  type="email"
                  placeholder="Referral contact email"
                  className={`${fieldCls} mt-2.5`}
                  value={form.referral_email || ''}
                  onChange={e => set('referral_email', e.target.value)}
                />
              )}
            </Section>
          </div>
        )}

        {tab === "notes" && (
          <Section label="Notes">
            <textarea
              placeholder="Any extra context, links, or reminders…"
              rows={6}
              className={`${fieldCls} resize-none leading-relaxed`}
              value={form.notes || ''}
              onChange={e => set('notes', e.target.value)}
            />
            <p className="text-[11px] text-gray-400 dark:text-white/20 mt-1">
              Optional — saved with your application for reference
            </p>
          </Section>
        )}

        <div className="flex gap-2 justify-between pt-5 mt-2 border-t border-gray-200 dark:border-white/[0.06]">
          <div>
            {!isFirst && (
              <Button variant="secondary" onClick={handleBack}>← Back</Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            {isLast
              ? <Button onClick={handleSave}>Save changes</Button>
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
      <p className="text-[11px] font-medium text-gray-500 dark:text-white/35 tracking-widest uppercase mb-2">{label}</p>
      {children}
    </div>
  )
}

function Divider() {
  return <hr className="border-gray-200 dark:border-white/[0.07] my-1" />
}
