import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Clock,
  Video,
  User,
  ArrowLeft,
  Pencil,
  Trash2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'

import Button from '../components/Button'
import ThemeToggle from '../components/ThemeToggle'
import Tabs from '../components/common/Tabs'
import ConfirmDialog from '../components/common/ConfirmDialog'
import InterviewModal from '../components/interviews/InterviewModal'
import InterviewPrep from '../components/interviews/InterviewPrep'

import {
  listInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
} from '../services/interviewService'
import { listJobs, addActivity } from '../services/jobService'
import { useProfile } from '../context/ProfileContext'
import { PageLoader } from '../components/common/Loader'

const TYPE_BADGE = {
  Phone: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  Video: 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  Technical: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  HR: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Behavioral: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  Final: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
}

const STATUS_BADGE = {
  Scheduled: 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  Completed: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Cancelled: 'border-gray-200 bg-gray-100 text-gray-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-400',
  Rescheduled: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
}

function formatWhen(iso) {
  if (!iso) return { date: 'Not scheduled', time: '', relative: '' }

  const d = new Date(iso)
  const days = Math.round((d - Date.now()) / (1000 * 60 * 60 * 24))

  let relative = ''
  if (days === 0) relative = 'Today'
  else if (days === 1) relative = 'Tomorrow'
  else if (days > 1) relative = `In ${days} days`
  else if (days === -1) relative = 'Yesterday'
  else relative = `${Math.abs(days)} days ago`

  return {
    date: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }),
    time: d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    relative,
  }
}

export default function Interviews() {
  const { profile } = useProfile()

  const [interviews, setInterviews] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filter, setFilter] = useState('upcoming')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [selected, setSelected] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [interviewList, jobList] = await Promise.all([listInterviews(), listJobs()])
      setInterviews(interviewList)
      setJobs(jobList)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not load your interviews.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  // Captured once per mount rather than read during render — the upcoming/past
  // split doesn't need to be second-accurate, and reading the clock while
  // rendering makes the result impure.
  const [now] = useState(() => Date.now())

  const { upcoming, past } = useMemo(() => {
    const up = []
    const done = []

    for (const i of interviews) {
      const isFuture = i.scheduled_at && new Date(i.scheduled_at).getTime() >= now
      if (isFuture && i.status === 'Scheduled') up.push(i)
      else done.push(i)
    }

    // Soonest first for upcoming, most recent first for past.
    up.sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    done.sort((a, b) => new Date(b.scheduled_at || 0) - new Date(a.scheduled_at || 0))

    return { upcoming: up, past: done }
  }, [interviews, now])

  const visible = filter === 'upcoming' ? upcoming : past

  async function handleSave(form) {
    try {
      if (editing) {
        const saved = await updateInterview(editing.id, form)
        setInterviews((prev) => prev.map((i) => (i.id === saved.id ? saved : i)))
        setSelected((prev) => (prev?.id === saved.id ? saved : prev))
      } else {
        const created = await createInterview(form)
        setInterviews((prev) => [...prev, created])

        if (created.job_id) {
          // Surfaces on the application's timeline in the tracker.
          await addActivity(
            created.job_id,
            'interview_scheduled',
            `${created.interview_type} interview scheduled with ${created.company}`,
            { interview_id: created.id },
          ).catch(() => {})
        }
      }
      setEditing(null)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not save that interview.')
    }
  }

  async function handlePrepUpdate(updates) {
    const saved = await updateInterview(selected.id, updates)
    setInterviews((prev) => prev.map((i) => (i.id === saved.id ? saved : i)))
    setSelected(saved)
    return saved
  }

  async function handleDelete() {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteInterview(pendingDelete.id)
      setInterviews((prev) => prev.filter((i) => i.id !== pendingDelete.id))
      if (selected?.id === pendingDelete.id) setSelected(null)
      setPendingDelete(null)
    } catch (err) {
      setError(err.message || 'Could not delete that interview.')
    } finally {
      setDeleting(false)
    }
  }

  /* ------------------------------------------------------------ prep view */

  if (selected) {
    const when = formatWhen(selected.scheduled_at)

    return (
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => setSelected(null)}
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          All interviews
        </button>

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selected.position}
                </h1>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${TYPE_BADGE[selected.interview_type]}`}>
                  {selected.interview_type}
                </span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[selected.status]}`}>
                  {selected.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">{selected.company}</p>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-white/35">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3 w-3" /> {when.date} · {when.relative}
                </span>
                {when.time && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" /> {when.time} · {selected.duration_minutes} min
                  </span>
                )}
                {selected.interviewer && (
                  <span className="flex items-center gap-1.5">
                    <User className="h-3 w-3" /> {selected.interviewer}
                  </span>
                )}
                {selected.meeting_url && (
                  <a
                    href={selected.meeting_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-violet-600 hover:underline dark:text-violet-400"
                  >
                    <Video className="h-3 w-3" /> Join
                  </a>
                )}
              </div>
            </div>

            <Button
              variant="secondary"
              onClick={() => { setEditing(selected); setShowModal(true) }}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          </div>
        </div>

        <InterviewPrep
          interview={selected}
          jobDescription={selected.job?.description}
          candidateSkills={profile?.skills}
          onSaveNotes={handlePrepUpdate}
        />

        {showModal && (
          <InterviewModal
            interview={editing}
            jobs={jobs}
            onSave={handleSave}
            onClose={() => { setShowModal(false); setEditing(null) }}
          />
        )}
      </div>
    )
  }

  /* ------------------------------------------------------------ list view */

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interviews</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {upcoming.length} upcoming · {past.length} past
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button onClick={() => { setEditing(null); setShowModal(true) }}>
            + Schedule interview
          </Button>
        </div>
      </div>

      <Tabs
        tabs={[
          { key: 'upcoming', label: 'Upcoming', badge: upcoming.length },
          { key: 'past', label: 'Past', badge: past.length },
        ]}
        active={filter}
        onChange={setFilter}
        className="mb-6"
      />

      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <PageLoader label="Loading interviews" />
      ) : visible.length === 0 ? (
        <div className="py-16 text-center">
          <CalendarDays className="mx-auto mb-3 h-8 w-8 opacity-30" strokeWidth={1.5} />
          <p className="text-sm text-gray-500 dark:text-gray-600">
            {filter === 'upcoming' ? 'No interviews scheduled.' : 'No past interviews.'}
          </p>
          {filter === 'upcoming' && (
            <div className="mt-4">
              <Button onClick={() => { setEditing(null); setShowModal(true) }}>
                + Schedule interview
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((interview) => {
            const when = formatWhen(interview.scheduled_at)

            return (
              <div
                key={interview.id}
                onClick={() => setSelected(interview)}
                className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:bg-gray-50 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.1] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-gray-100 dark:bg-white/[0.06]">
                    <span className="text-[9px] uppercase text-gray-500 dark:text-white/35">
                      {when.date.split(' ')[2] || ''}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {when.date.split(' ')[1] || '—'}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-200">
                        {interview.position}
                      </span>
                      <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${TYPE_BADGE[interview.interview_type]}`}>
                        {interview.interview_type}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 text-xs text-gray-500 dark:text-gray-600">
                      <span className="truncate">{interview.company}</span>
                      {when.time && <span>· {when.time}</span>}
                      <span>· {when.relative}</span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                  {interview.prep_material?.technical?.length > 0 && (
                    <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-700 dark:text-violet-300">
                      Prep ready
                    </span>
                  )}

                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[interview.status]}`}>
                    {interview.status}
                  </span>

                  {interview.meeting_url && (
                    <a
                      href={interview.meeting_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="Join meeting"
                      className="rounded-md p-1.5 text-gray-400 transition-colors hover:text-violet-600 dark:hover:text-violet-400"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}

                  <button
                    onClick={(e) => { e.stopPropagation(); setEditing(interview); setShowModal(true) }}
                    aria-label="Edit interview"
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:text-gray-700 dark:text-white/25 dark:hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); setPendingDelete(interview) }}
                    aria-label="Delete interview"
                    className="rounded-md p-1.5 text-gray-400 transition-all hover:bg-rose-500/10 hover:text-rose-600 dark:text-white/25 dark:hover:text-rose-400 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <InterviewModal
          interview={editing}
          jobs={jobs}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditing(null) }}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this interview?"
          message={`The ${pendingDelete.interview_type} interview with ${pendingDelete.company} and its prep notes will be removed.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
          busy={deleting}
        />
      )}
    </div>
  )
}
