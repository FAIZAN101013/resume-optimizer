import { useEffect, useState } from 'react'
import {
  Plus,
  ArrowRight,
  Mail,
  FileText,
  CalendarCheck,
  Circle,
} from 'lucide-react'

import Loader from '../common/Loader'
import { listJobActivities } from '../../services/jobService'
import { STATUS_BADGE } from '../../lib/constants'

// Activity types are written by database triggers (created, status_changed)
// and by the app for things the database can't see.
const ICONS = {
  created: Plus,
  status_changed: ArrowRight,
  email_generated: Mail,
  resume_optimized: FileText,
  interview_scheduled: CalendarCheck,
}

function formatWhen(iso) {
  const date = new Date(iso)
  const elapsedDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)

  const time = date.toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  })

  if (elapsedDays < 1) return `Today · ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
  if (elapsedDays < 2) return `Yesterday · ${date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`

  return time
}

export default function JobTimeline({ jobId }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await listJobActivities(jobId)
        if (!cancelled) setActivities(data)
      } catch (err) {
        console.error(err)
        if (!cancelled) setError(err.message || 'Could not load the timeline.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [jobId])

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader size="md" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-600 dark:text-rose-400">
        {error}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-gray-500 dark:text-white/30">
        No activity recorded yet.
      </p>
    )
  }

  return (
    <div className="relative">
      {/* Spine */}
      <div className="absolute bottom-2 left-[11px] top-2 w-px bg-gray-200 dark:bg-white/[0.08]" />

      <ol className="space-y-4">
        {activities.map((activity) => {
          const Icon = ICONS[activity.activity_type] || Circle
          const to = activity.metadata?.to

          return (
            <li key={activity.id} className="relative flex gap-3 pl-0">
              <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 dark:border-white/[0.1] dark:bg-[#13131c] dark:text-gray-400">
                <Icon className="h-3 w-3" strokeWidth={2} />
              </div>

              <div className="min-w-0 flex-1 pb-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {activity.description}
                  </p>

                  {to && STATUS_BADGE[to] && (
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_BADGE[to]}`}>
                      {to}
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-[11px] text-gray-400 dark:text-white/25">
                  {formatWhen(activity.created_at)}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
