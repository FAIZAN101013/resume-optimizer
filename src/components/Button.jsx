import { Link } from 'react-router-dom'

export default function Button({
  children,
  to,
  onClick,
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
    secondary: 'bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] backdrop-blur-md text-gray-300',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/[0.04]',
  }

  const base = `inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] ${sizes[size]} ${variants[variant]} ${className}`

  // If "to" is passed, render a Link
  if (to) {
    return (
      <Link to={to} className={base}>
        {children}
      </Link>
    )
  }

  // Otherwise render a button
  return (
    <button onClick={onClick} className={base}>
      {children}
    </button>
  )
}