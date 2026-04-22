import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/optimizer', label: 'Optimizer' },
    { to: '/tracker', label: 'Job Tracker' },
  ]

  return (
    <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <span className="font-bold text-lg tracking-tight">
        Career<span className="text-violet-400">OS</span>
      </span>
      <div className="flex gap-6">
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`text-sm transition-colors ${
              pathname === l.to
                ? 'text-violet-400 font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default Navbar