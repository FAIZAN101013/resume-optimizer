import Button from '../Button'
import ThemeToggle from '../ThemeToggle'
import { Download } from 'lucide-react'

export default function TrackerHeader({ count, onAdd, onExport }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Tracker</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {count} application{count !== 1 ? 's' : ''} tracked
        </p>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-white/20 text-sm transition-all duration-150"
        >
          <Download className="w-3.5 h-3.5" strokeWidth={1.75} />
          Export CSV
        </button>
        <Button onClick={onAdd}>+ Add Job</Button>
      </div>
    </div>
  )
}
