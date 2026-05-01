const STATUS_CONFIG = {
  Applied:   'violet',
  Interview: 'amber',
  Offer:     'emerald',
  Rejected:  'rose',
}

export default function StatsBar({ counts, activeFilter, onFilter }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {Object.entries(STATUS_CONFIG).map(([status, color]) => (
        <div
          key={status}
          onClick={() => onFilter(status)}
          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
            activeFilter === status
              ? `bg-${color}-500/10 border-${color}-500/30`
              : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'
          }`}
        >
          <div className="text-2xl font-bold text-white mb-0.5">
            {counts[status]}
          </div>
          <div className="text-xs text-gray-500 font-medium">{status}</div>
        </div>
      ))}
    </div>
  )
}