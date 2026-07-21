// Underline tabs, matching the pattern already used inside the job modals.
// tabs: [{ key, label, icon?, badge? }]
export default function Tabs({ tabs, active, onChange, className = '' }) {
  return (
    <div
      className={`flex gap-1 overflow-x-auto border-b border-gray-200 scrollbar-none dark:border-white/[0.06] ${className}`}
      role="tablist"
    >
      {tabs.map(({ key, label, icon: Icon, badge }) => {
        const isActive = active === key

        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(key)}
            className={`-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm transition-all ${
              isActive
                ? 'border-violet-500 text-violet-700 dark:text-violet-300'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-white/35 dark:hover:text-white/60'
            }`}
          >
            {Icon && <Icon className="h-4 w-4" strokeWidth={1.75} />}
            {label}

            {badge != null && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                  isActive
                    ? 'bg-violet-500/15 text-violet-600 dark:text-violet-300'
                    : 'bg-gray-100 text-gray-500 dark:bg-white/[0.06] dark:text-white/35'
                }`}
              >
                {badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
