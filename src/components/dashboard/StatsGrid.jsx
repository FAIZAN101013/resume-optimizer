import { Briefcase, Send, TrendingUp, Award, XCircle } from 'lucide-react'

// Total leads, because "how many have I actually sent" is the first thing
// anyone wants to know. Saved jobs are excluded from it — they aren't
// applications yet.
const CARDS = [
  {
    key: 'total',
    label: 'Total',
    icon: Briefcase,
    iconCls: 'bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-400',
    valueCls: 'text-gray-900 dark:text-white',
  },
  {
    key: 'Applied',
    label: 'Applied',
    icon: Send,
    iconCls: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    valueCls: 'text-violet-600 dark:text-violet-400',
  },
  {
    key: 'Interview',
    label: 'Interviews',
    icon: TrendingUp,
    iconCls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    valueCls: 'text-amber-600 dark:text-amber-400',
  },
  {
    key: 'Offer',
    label: 'Offers',
    icon: Award,
    iconCls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    valueCls: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'Rejected',
    label: 'Rejected',
    icon: XCircle,
    iconCls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    valueCls: 'text-rose-600 dark:text-rose-400',
  },
]

export default function StatsGrid({ counts, total }) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
      {CARDS.map(({ key, label, icon: Icon, iconCls, valueCls }) => (
        <div
          key={key}
          className="rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-gray-300 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.1]"
        >
          <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${iconCls}`}>
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </div>

          <div className={`mb-0.5 text-2xl font-bold tabular-nums ${valueCls}`}>
            {key === 'total' ? total : counts[key] ?? 0}
          </div>

          <div className="text-xs font-medium text-gray-600 dark:text-gray-500">{label}</div>
        </div>
      ))}
    </div>
  )
}
