const FILTERS = ['All', 'Applied', 'Interview', 'Offer', 'Rejected']

export default function FilterTabs({ activeFilter, onFilter, counts }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      {FILTERS.map(f => (
        <button
          key={f}
          onClick={() => onFilter(f)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
            activeFilter === f
              ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] border border-transparent'
          }`}
        >
          {f}
          {f !== 'All' && (
            <span className="ml-1.5 text-[10px] opacity-60">{counts[f]}</span>
          )}
        </button>
      ))}
    </div>
  )
}