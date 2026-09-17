import { JOB_STATUSES } from '../../lib/constants'

const FILTERS = ['All', ...JOB_STATUSES]

export default function FilterTabs({ activeFilter, onFilter, counts, total }) {
  return (
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {FILTERS.map((f) => {
        const count = f === 'All' ? total : counts[f]

        return (
          <button
            key={f}
            onClick={() => onFilter(f)}
            className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
              activeFilter === f
                ? 'border-violet-500/30 bg-violet-600/20 text-violet-700 dark:text-violet-300'
                : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-500 dark:hover:bg-white/[0.04] dark:hover:text-gray-300'
            }`}
          >
            {f}
            <span className="ml-1.5 text-[10px] opacity-60">{count ?? 0}</span>
          </button>
        )
      })}
    </div>
  )
}
