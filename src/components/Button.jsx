import { Link } from 'react-router-dom'

export default function Button({
  children,
  to,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
}) {

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const variants = {
    primary: 'bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white hover:shadow-lg hover:shadow-violet-500/30',
    secondary: 'bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] dark:border-white/[0.08] dark:backdrop-blur-md dark:text-gray-300',
    ghost: 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.04]',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    dangerOutline: 'border border-red-600 text-red-400 hover:bg-red-600/10',
  }

  const base = `inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 ${sizes[size]} ${variants[variant]} ${className}`

  // If "to" is passed, render a Link
  if (to) {
    return (
      <Link to={to} className={base} aria-disabled={disabled}>
        {children}
      </Link>
    )
  }

  // Otherwise render a button
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={base}>
      {children}
    </button>
  )
}
