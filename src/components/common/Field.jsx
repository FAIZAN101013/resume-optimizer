// Shared form primitives. Sized to match the job modals so forms across the
// app read as one system.

export const fieldClasses =
  'w-full px-3 py-2 rounded-lg border text-sm transition-colors ' +
  'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 ' +
  'focus:outline-none focus:border-violet-400 focus:bg-white ' +
  'dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-white ' +
  'dark:placeholder-white/25 dark:focus:border-white/30 dark:focus:bg-white/[0.06] ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

export function Label({ htmlFor, children, hint }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 flex items-baseline justify-between gap-2 text-xs font-medium text-gray-600 dark:text-gray-400"
    >
      <span>{children}</span>
      {hint && (
        <span className="text-[10px] font-normal text-gray-400 dark:text-white/20">
          {hint}
        </span>
      )}
    </label>
  )
}

export function Input({ label, hint, name, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <Label htmlFor={name} hint={hint}>{label}</Label>}
      <input id={name} name={name} className={fieldClasses} {...props} />
    </div>
  )
}

export function Textarea({ label, hint, name, rows = 4, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <Label htmlFor={name} hint={hint}>{label}</Label>}
      <textarea
        id={name}
        name={name}
        rows={rows}
        className={`${fieldClasses} resize-none leading-relaxed`}
        {...props}
      />
    </div>
  )
}

export function Select({ label, hint, name, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <Label htmlFor={name} hint={hint}>{label}</Label>}
      <select id={name} name={name} className={fieldClasses} {...props}>
        {children}
      </select>
    </div>
  )
}

export function Toggle({ label, description, name, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 transition-colors hover:bg-gray-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
        {description && (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-white/35">{description}</p>
        )}
      </div>

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 cursor-pointer accent-violet-500"
      />
    </label>
  )
}
