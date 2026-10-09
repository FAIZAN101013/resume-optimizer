import { Link } from 'react-router-dom'
import { Plus, FileEdit, Sparkles, CalendarPlus } from 'lucide-react'

// The four actions the spec asks for, each landing on the page that performs
// it rather than a generic module home.
const ACTIONS = [
  {
    label: 'Add job',
    hint: 'Track a new application',
    to: '/tracker',
    icon: Plus,
    tone: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  },
  {
    label: 'Optimize resume',
    hint: 'Score against a job',
    to: '/optimizer',
    icon: FileEdit,
    tone: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  },
  {
    label: 'Generate email',
    hint: 'Follow up or thank',
    to: '/assistant',
    icon: Sparkles,
    tone: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  {
    label: 'Schedule interview',
    hint: 'Add a round',
    to: '/interviews',
    icon: CalendarPlus,
    tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
]

export default function QuickActions() {
  return (
    <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {ACTIONS.map(({ label, hint, to, icon: Icon, tone }) => (
        <Link
          key={to}
          to={to}
          className="group rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-gray-300 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.1]"
        >
          <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
            <Icon className="h-4 w-4" strokeWidth={1.75} />
          </div>

          <div className="text-sm font-semibold text-gray-900 dark:text-white">{label}</div>
          <div className="mt-0.5 text-xs text-gray-500 dark:text-white/30">{hint}</div>
        </Link>
      ))}
    </div>
  )
}
