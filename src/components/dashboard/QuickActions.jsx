import { FileEdit, BarChart2, ArrowRight } from 'lucide-react'
import Button from '../Button'

export default function QuickActions({ jobCount }) {
  return (
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
            <div className="text-xs text-gray-500">
              {jobCount} active application{jobCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        <Button to="/tracker" size="sm" variant="secondary">
          Open <ArrowRight className="w-3 h-3" />
        </Button>
      </div>

    </div>
  )
}