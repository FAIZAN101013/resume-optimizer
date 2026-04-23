import { Link } from 'react-router-dom'

const STATUS_BADGE = {
  Applied:   'text-violet-400 bg-violet-500/10 border-violet-500/20',
  Interview: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Offer:     'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Rejected:  'text-rose-400 bg-rose-500/10 border-rose-500/20',
}

export default function RecentJobs({ jobs }) {
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">

      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Recent Applications</h2>
        <Link
          to="/tracker"
          className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
        >
          View all →
        </Link>
      </div>

      {/* Empty state */}
      {jobs.length === 0 ? (
        <div className="px-5 py-10 text-center text-gray-600 text-sm">
          No applications yet.{' '}
          <Link to="/tracker" className="text-violet-400 hover:underline">
            Add your first one →
          </Link>
        </div>
      ) : (
        jobs.map((job) => (
          <div
            key={job.id}
            className="px-5 py-3.5 flex items-center justify-between border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold text-gray-300">
                {job.company[0]}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-200">{job.company}</div>
                <div className="text-xs text-gray-600">{job.role}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${STATUS_BADGE[job.status]}`}>
                {job.status}
              </span>
              <span className="text-xs text-gray-600 w-16 text-right">{job.date}</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}