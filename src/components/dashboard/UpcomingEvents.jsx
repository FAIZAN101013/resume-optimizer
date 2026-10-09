import { Link } from 'react-router-dom'
import { CalendarDays, Video } from 'lucide-react'

const TYPE_BADGE = {
  Phone: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  Video: 'border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  Technical: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  HR: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  Behavioral: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  Final: 'border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300',
}

function when(iso) {
  const d = new Date(iso)
  const days = Math.round((d - Date.now()) / (1000 * 60 * 60 * 24))

  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

  if (days === 0) return { label: 'Today', time, urgent: true }
  if (days === 1) return { label: 'Tomorrow', time, urgent: true }

  return {
    label: d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }),
    time,
    urgent: false,
  }
}

export default function UpcomingEvents({ interviews }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-white/[0.06]">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Upcoming Interviews
        </h2>
        <Link
          to="/interviews"
          className="text-xs text-violet-600 transition-colors hover:text-violet-500 dark:text-violet-400"
        >
          View all →
        </Link>
      </div>

      {interviews.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <CalendarDays className="mx-auto mb-2 h-6 w-6 opacity-30" strokeWidth={1.5} />
          <p className="text-sm text-gray-500 dark:text-gray-600">
            Nothing scheduled.{' '}
            <Link to="/interviews" className="text-violet-600 hover:underline dark:text-violet-400">
              Add an interview →
            </Link>
          </p>
        </div>
      ) : (
        interviews.map((interview) => {
          const w = when(interview.scheduled_at)

          return (
            <Link
              key={interview.id}
              to="/interviews"
              className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 transition-colors last:border-0 hover:bg-gray-50 dark:border-white/[0.04] dark:hover:bg-white/[0.02]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    w.urgent
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-gray-400'
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.75} />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-200">
                    {interview.position}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-600">
                    <span className="truncate">{interview.company}</span>
                    {interview.meeting_url && <Video className="h-2.5 w-2.5 shrink-0" />}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                    TYPE_BADGE[interview.interview_type]
                  }`}
                >
                  {interview.interview_type}
                </span>

                <div className="text-right">
                  <div
                    className={`text-xs font-medium ${
                      w.urgent
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {w.label}
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-600">{w.time}</div>
                </div>
              </div>
            </Link>
          )
        })
      )}
    </div>
  )
}
