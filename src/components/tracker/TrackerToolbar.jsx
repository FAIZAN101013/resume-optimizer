import { Search, X, ArrowUpDown, CalendarRange } from 'lucide-react'
import { SORT_OPTIONS, DATE_RANGES } from '../../lib/jobFilters'

const selectCls =
  'appearance-none rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-8 pr-7 text-xs ' +
  'text-gray-700 transition-colors focus:border-violet-500/40 focus:bg-white focus:outline-none ' +
  'dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-gray-300 dark:focus:bg-white/[0.05]'

export default function TrackerToolbar({
  search,
  onSearch,
  sort,
  onSort,
  dateRange,
  onDateRange,
  resultCount,
  totalCount,
}) {
  const isFiltered = search || dateRange !== 'all'

  return (
    <div className="mb-5 space-y-2.5">
      <div className="flex flex-col gap-2.5 sm:flex-row">

        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-600"
            strokeWidth={1.75}
          />
          <input
            type="text"
            placeholder="Search company, title, location, recruiter…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-9 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-violet-500/40 focus:bg-white focus:outline-none dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-gray-200 dark:placeholder-gray-600 dark:focus:bg-white/[0.05]"
          />
          {search && (
            <button
              onClick={() => onSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-700 dark:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Date range */}
        <div className="relative">
          <CalendarRange
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-600"
            strokeWidth={1.75}
          />
          <select
            value={dateRange}
            onChange={(e) => onDateRange(e.target.value)}
            aria-label="Filter by date"
            className={`${selectCls} w-full sm:w-auto`}
          >
            {DATE_RANGES.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="relative">
          <ArrowUpDown
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-600"
            strokeWidth={1.75}
          />
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            aria-label="Sort applications"
            className={`${selectCls} w-full sm:w-auto`}
          >
            {SORT_OPTIONS.map(({ key, label }) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {isFiltered && (
        <p className="text-xs text-gray-500 dark:text-white/35">
          Showing {resultCount} of {totalCount} applications
        </p>
      )}
    </div>
  )
}
