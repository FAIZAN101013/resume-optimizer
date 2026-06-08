const STATUS_CONFIG = {
  Applied:   { active: 'bg-violet-500/10 border-violet-500/30' },
  Interview: { active: 'bg-amber-500/10 border-amber-500/30' },
  Offer:     { active: 'bg-emerald-500/10 border-emerald-500/30' },
  Rejected:  { active: 'bg-rose-500/10 border-rose-500/30' },
}

const INACTIVE =
  'bg-white border-gray-200 hover:border-gray-300 dark:bg-white/[0.02] dark:border-white/[0.06] dark:hover:border-white/[0.1]'

export default function StatsBar({ counts, activeFilter, onFilter }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {Object.entries(STATUS_CONFIG).map(([status, { active }]) => (
        <div
          key={status}
          onClick={() => onFilter(status)}
          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
            activeFilter === status ? active : INACTIVE
          }`}
        >
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-0.5">
            {counts[status]}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-500 font-medium">{status}</div>
        </div>
      ))}
    </div>
  )
}
