import { useState } from 'react'
import { FileText, Settings, StickyNote } from 'lucide-react'

import Button from '../Button'
import JobBasicTab from './modal-components/JobBasicTab'
import JobDetailsTab from './modal-components/JobDetailsTab'
import JobNotesTab from './modal-components/JobNotesTab'
import { JOB_STATUSES, STATUS_ACTIVE, STATUS_INACTIVE } from '../../lib/constants'

// Same tabs as the add modal — they render the identical field set, so edit
// and add can never drift apart.
const TABS = [
  { key: 'basic', label: 'Basic', icon: FileText },
  { key: 'details', label: 'Details', icon: Settings },
  { key: 'notes', label: 'Notes', icon: StickyNote },
]

const STATUS_OPTIONS = JOB_STATUSES.map((key) => ({ key, active: STATUS_ACTIVE[key] }))

export default function JobEditModal({ job, onSave, onClose }) {
  const [tab, setTab] = useState('basic')
  const [form, setForm] = useState({ ...job })
  const [errors, setErrors] = useState({})

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: false }))
  }

  const validate = () => {
    const next = {}
    if (!form.company?.trim()) next.company = true
    if (!form.title?.trim()) next.title = true
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = () => {
    if (!validate()) {
      setTab('basic')
      return
    }
    onSave(form)
    onClose()
  }

  const fieldBase =
    'w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/[0.04] border text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 transition-colors focus:outline-none focus:bg-white dark:focus:bg-white/[0.06]'

  const fieldCls = (key) =>
    fieldBase +
    (errors[key]
      ? ' border-red-500/60 focus:border-red-400'
      : ' border-gray-200 dark:border-white/[0.08] focus:border-violet-400 dark:focus:border-white/30')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex max-h-[90vh] w-full max-w-[460px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl dark:border-white/[0.09] dark:bg-[#13131c] dark:text-white">

        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 p-6 pb-4 dark:border-white/[0.06]">
          <div>
            <h2 className="text-[17px] font-medium tracking-tight">Edit application</h2>
            <p className="mt-0.5 text-[11px] text-gray-400 dark:text-white/25">
              {form.company} · {form.title}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700 dark:border-white/10 dark:text-white/50 dark:hover:border-white/20 dark:hover:text-white/80"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        <div className="flex shrink-0 gap-1 border-b border-gray-200 px-6 pt-3 dark:border-white/[0.07]">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-3 py-2 text-sm transition-all ${
                tab === key
                  ? 'border-violet-500 text-violet-700 dark:text-violet-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-white/35 dark:hover:text-white/60'
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
          {tab === 'basic' && (
            <JobBasicTab form={form} set={set} fieldCls={fieldCls} errors={errors} />
          )}

          {tab === 'details' && (
            <JobDetailsTab
              form={form}
              set={set}
              fieldCls={fieldCls}
              STATUS_OPTIONS={STATUS_OPTIONS}
              STATUS_INACTIVE={STATUS_INACTIVE}
            />
          )}

          {tab === 'notes' && (
            <JobNotesTab form={form} set={set} fieldCls={fieldCls} />
          )}
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 px-6 py-4 dark:border-white/[0.06]">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </div>
    </div>
  )
}
