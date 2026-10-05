import { useState } from 'react'

import Button from '../Button'
import { Input, Select, Textarea, fieldClasses, Label } from '../common/Field'
import { INTERVIEW_TYPES, INTERVIEW_STATUSES } from '../../lib/constants'

// scheduled_at is a timestamptz; the form edits it as separate date and time
// inputs because that's how people think about an interview.
function splitTimestamp(iso) {
  if (!iso) return { date: '', time: '' }

  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { date: '', time: '' }

  const pad = (n) => String(n).padStart(2, '0')
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

function joinTimestamp(date, time) {
  if (!date) return null
  // Local time in, ISO out — the database stores UTC.
  return new Date(`${date}T${time || '09:00'}`).toISOString()
}

export default function InterviewModal({ interview, jobs, onSave, onClose }) {
  const initial = splitTimestamp(interview?.scheduled_at)

  const [form, setForm] = useState({
    job_id: interview?.job_id || '',
    company: interview?.company || '',
    position: interview?.position || '',
    interview_type: interview?.interview_type || 'Video',
    duration_minutes: interview?.duration_minutes ?? 60,
    interviewer: interview?.interviewer || '',
    meeting_url: interview?.meeting_url || '',
    notes: interview?.notes || '',
    status: interview?.status || 'Scheduled',
  })

  const [date, setDate] = useState(initial.date)
  const [time, setTime] = useState(initial.time)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: false }))
  }

  // Picking a tracked application fills in the company and role, so the two
  // records can't disagree about which job this interview is for.
  function handleJobChange(jobId) {
    set('job_id', jobId)
    if (!jobId) return

    const job = jobs.find((j) => j.id === jobId)
    if (!job) return

    setForm((prev) => ({
      ...prev,
      job_id: jobId,
      company: job.company || prev.company,
      position: job.title || prev.position,
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const next = {}
    if (!form.company.trim()) next.company = true
    if (!form.position.trim()) next.position = true
    if (!date) next.date = true

    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    try {
      await onSave({
        ...form,
        job_id: form.job_id || null,
        duration_minutes: Number(form.duration_minutes) || 60,
        scheduled_at: joinTimestamp(date, time),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl dark:border-white/[0.09] dark:bg-[#13131c] dark:text-white"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 p-6 pb-4 dark:border-white/[0.06]">
          <h2 className="text-[17px] font-medium tracking-tight">
            {interview ? 'Edit interview' : 'Schedule interview'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:text-gray-700 dark:border-white/10 dark:text-white/50 dark:hover:text-white/80"
          >
            <span className="text-lg leading-none">×</span>
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6 scrollbar-none">
          {jobs.length > 0 && (
            <Select
              label="Linked application"
              hint="Optional"
              name="job_id"
              value={form.job_id}
              onChange={(e) => handleJobChange(e.target.value)}
            >
              <option value="">Not linked</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} — {job.company}
                </option>
              ))}
            </Select>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                label="Company"
                name="company"
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder="ABC Technologies"
              />
              {errors.company && (
                <p className="mt-1 text-xs text-red-500">Required</p>
              )}
            </div>

            <div>
              <Input
                label="Position"
                name="position"
                value={form.position}
                onChange={(e) => set('position', e.target.value)}
                placeholder="Frontend Developer"
              />
              {errors.position && (
                <p className="mt-1 text-xs text-red-500">Required</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Type"
              name="interview_type"
              value={form.interview_type}
              onChange={(e) => set('interview_type', e.target.value)}
            >
              {INTERVIEW_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>

            <Select
              label="Status"
              name="status"
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            >
              {INTERVIEW_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="date">Date</Label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); setErrors((p) => ({ ...p, date: false })) }}
                className={fieldClasses}
              />
              {errors.date && <p className="mt-1 text-xs text-red-500">Required</p>}
            </div>

            <div>
              <Label htmlFor="time">Time</Label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={fieldClasses}
              />
            </div>

            <Input
              label="Minutes"
              name="duration_minutes"
              type="number"
              min="15"
              step="15"
              value={form.duration_minutes}
              onChange={(e) => set('duration_minutes', e.target.value)}
            />
          </div>

          <Input
            label="Interviewer"
            hint="Optional"
            name="interviewer"
            value={form.interviewer}
            onChange={(e) => set('interviewer', e.target.value)}
            placeholder="Name and role"
          />

          <Input
            label="Meeting link"
            hint="Optional"
            name="meeting_url"
            type="url"
            value={form.meeting_url}
            onChange={(e) => set('meeting_url', e.target.value)}
            placeholder="https://meet.google.com/…"
          />

          <Textarea
            label="Notes"
            name="notes"
            rows={3}
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Anything to remember about this round…"
          />
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 px-6 py-4 dark:border-white/[0.06]">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : interview ? 'Save changes' : 'Schedule'}
          </Button>
        </div>
      </form>
    </div>
  )
}
