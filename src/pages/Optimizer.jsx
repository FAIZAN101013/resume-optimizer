import ThemeToggle from '../components/ThemeToggle'

export default function Optimizer() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Resume Optimizer
          </h1>
          <p className="text-gray-500 text-sm">
            6 AI tools to audit, rewrite, and align your resume.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="rounded-xl bg-white border border-gray-200 dark:bg-white/[0.02] dark:border-white/[0.06] p-10 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Optimizer tools coming soon.
        </p>
      </div>
    </div>
  )
}
