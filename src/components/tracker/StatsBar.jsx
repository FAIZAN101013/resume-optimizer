import { Briefcase, Activity, CalendarCheck, Award } from 'lucide-react'

// Per-status counts already live in the filter tabs, so this row summarises
// the pipeline instead of repeating them.
const ACTIVE_STATUSES = ['Applied', 'Screening', 'Interview']

export default function StatsBar({ counts, total, activeFilter, onFilter }) {
  const active = ACTIVE_STATUSES.reduce((sum, s) => sum + (counts[s] || 0), 0)

  const cards = [
    {
      key: 'total',
      label: 'Total',
      value: total,
      icon: Briefcase,
      tone: 'text-gray-900 dark:text-white',
      iconTone: 'bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-gray-400',
      filter: 'All',
    },
    {
      key: 'active',
      label: 'In progress',
      value: active,
      icon: Activity,
      tone: 'text-violet-600 dark:text-violet-400',
      iconTone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
      // Spans three statuses, so there's no single filter to jump to.
      filter: null,
    },
    {
      key: 'interview',
      label: 'Interviews',
      value: counts.Interview || 0,
      icon: CalendarCheck,
      tone: 'text-amber-600 dark:text-amber-400',
      iconTone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      filter: 'Interview',
    },
    {
      key: 'offer',
      label: 'Offers',
      value: counts.Offer || 0,
      icon: Award,
      tone: 'text-emerald-600 dark:text-emerald-400',
      iconTone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      filter: 'Offer',
    },
  ]

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map(({ key, label, value, icon: Icon, tone, iconTone, filter }) => {
        const isActive = filter && activeFilter === filter

        return (
          <div
            key={key}
            onClick={filter ? () => onFilter(filter) : undefined}
            className={`rounded-xl border p-4 transition-all duration-200 ${
              filter ? 'cursor-pointer' : ''
            } ${
              isActive
                ? 'border-violet-500/30 bg-violet-500/[0.06]'
                : 'border-gray-200 bg-white hover:border-gray-300 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.1]'
            }`}
          >
            <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${iconTone}`}>
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </div>

            <div className={`mb-0.5 text-2xl font-bold ${tone}`}>{value}</div>
            <div className="text-xs font-medium text-gray-600 dark:text-gray-500">{label}</div>
          </div>
        )
      })}
    </div>
  )
}
