import { Link } from 'react-router-dom'

const STATUS_BADGE = {
  Applied:   'text-violet-700 bg-violet-500/10 border-violet-500/20 dark:text-violet-400',
  Interview: 'text-amber-700 bg-amber-500/10 border-amber-500/20 dark:text-amber-400',
  Offer:     'text-emerald-700 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400',
  Rejected:  'text-rose-700 bg-rose-500/10 border-rose-500/20 dark:text-rose-400',
}

export default function RecentJobs({ jobs }) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 dark:bg-white/[0.02] dark:border-white/[0.06] overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-white/[0.06] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Applications</h2>
        <Link
          to="/tracker"
          className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 transition-colors"
        >
          View all →
        </Link>
      </div>

      {/* Empty state */}
      {jobs.length === 0 ? (
        <div className="px-5 py-10 text-center text-gray-500 dark:text-gray-600 text-sm">
          No applications yet.{' '}
          <Link to="/tracker" className="text-violet-600 dark:text-violet-400 hover:underline">
            Add your first one →
          </Link>
        </div>
      ) : (
        jobs.map((job) => (
          <div
            key={job.id}
            className="px-5 py-3.5 flex items-center justify-between border-b border-gray-100 dark:border-white/[0.04] last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300">
                {job.company[0]}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{job.company}</div>
                <div className="text-xs text-gray-500 dark:text-gray-600">{job.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${STATUS_BADGE[job.status]}`}>
                {job.status}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-600 w-16 text-right">{job.date}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
