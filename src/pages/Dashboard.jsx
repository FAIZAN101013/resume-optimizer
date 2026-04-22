import { Link } from 'react-router-dom'
import { ArrowRight, FileEdit, BarChart2, Briefcase, TrendingUp, Award, XCircle } from 'lucide-react'
import Button from '../components/Button'
import { stats, recentJobs, statusStyles, colorStyles } from '../data/dashboardData'

export default function Dashboard() {
  return (
    <div className="max-w-5xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          Welcome back, Faizan 👋
        </h1>
        <p className="text-gray-500 text-sm">
          Here's what's happening with your job search today.
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, change }) => {
          const style = colorStyles[color]
          return (
            <div
              key={label}
              className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all duration-200"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${style.icon}`}>
                <Icon className="w-4 h-4" strokeWidth={1.75} />
              </div>
              <div className={`text-2xl font-bold mb-0.5 ${style.value}`}>
                {value}
              </div>
              <div className="text-xs text-gray-500 font-medium">{label}</div>
              <div className="text-[10px] text-gray-700 mt-1">{change}</div>
            </div>
          )
        })}
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="p-5 rounded-xl bg-violet-500/[0.06] border border-violet-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <FileEdit className="w-4 h-4 text-violet-400" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Resume Optimizer</div>
              <div className="text-xs text-gray-500">6 AI tools ready</div>
            </div>
          </div>
          <Button to="/optimizer" size="sm">
            Open <ArrowRight className="w-3 h-3" />
          </Button>
        </div>

        <div className="p-5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-emerald-400" strokeWidth={1.75} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Job Tracker</div>
              <div className="text-xs text-gray-500">12 active applications</div>
            </div>
          </div>
          <Button to="/tracker" size="sm" variant="secondary">
            Open <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* ── Recent Applications ── */}
      <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">

        {/* Table header */}
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recent Applications</h2>
          <Link to="/tracker" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
            View all →
          </Link>
        </div>

        {/* Rows */}
        {recentJobs.map((job, i) => (
          <div
            key={i}
            className="px-5 py-3.5 flex items-center justify-between border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
          >
            {/* Company + Role */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold text-gray-300">
                {job.company[0]}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-200">{job.company}</div>
                <div className="text-xs text-gray-600">{job.role}</div>
              </div>
            </div>

            {/* Status + Date */}
            <div className="flex items-center gap-4">
              <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${statusStyles[job.status]}`}>
                {job.status}
              </span>
              <span className="text-xs text-gray-600 w-12 text-right">{job.date}</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}