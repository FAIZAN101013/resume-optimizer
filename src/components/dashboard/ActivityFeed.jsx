import { Plus, ArrowRight, Mail, FileText, CalendarCheck, Circle } from 'lucide-react'

const ICONS = {
  created: Plus,
  status_changed: ArrowRight,
  email_generated: Mail,
  resume_optimized: FileText,
  interview_scheduled: CalendarCheck,
}

function ago(iso) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)

  const units = [
    ['d', 86400],
    ['h', 3600],
    ['m', 60],
  ]

  for (const [suffix, size] of units) {
    const value = Math.floor(seconds / size)
    if (value >= 1) return `${value}${suffix} ago`
  }

  return 'just now'
}

export default function ActivityFeed({ activities }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-white/[0.06]">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Career Activity</h2>
      </div>

      {activities.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-600">
          Your activity appears here as you track applications.
        </div>
      ) : (
        <ul className="px-5 py-4">
          {activities.map((activity, i) => {
            const Icon = ICONS[activity.activity_type] || Circle
            const isLast = i === activities.length - 1

            return (
              <li key={activity.id} className="relative flex gap-3 pb-4 last:pb-0">
                {/* Spine, stopping at the last item */}
                {!isLast && (
                  <span className="absolute left-[11px] top-6 h-full w-px bg-gray-200 dark:bg-white/[0.08]" />
                )}

                <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 dark:border-white/[0.1] dark:bg-[#13131c] dark:text-gray-400">
                  <Icon className="h-3 w-3" strokeWidth={2} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-gray-700 dark:text-gray-300">
                    {activity.description}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400 dark:text-white/25">
                    {ago(activity.created_at)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
