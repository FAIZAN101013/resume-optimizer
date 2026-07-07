import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from './Button'
import Logo from './Logo/Logo'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { user } = useAuth()
  const { profile } = useProfile()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      style={{ transform: "translateZ(0)" }}
      className={`px-8 flex items-center justify-between sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "py-3 bg-white/95 dark:bg-[#0a0a0f]/95 backdrop-blur-xl shadow-md shadow-gray-200/50 dark:shadow-black/40 border-b border-gray-200 dark:border-white/[0.06]"
          : "py-4 bg-white dark:bg-[#0a0a0f]"
      }`}
    >
      <Logo showTagline={false} textClassName="text-lg" />

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {user ? (
          <>
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-300 dark:hover:bg-white/[0.08]"
            >
              <img
                src={
                  profile?.avatar_url ||
                  "https://ui-avatars.com/api/?name=User&background=27272a&color=ffffff"
                }
                alt="Profile"
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="hidden max-w-32 truncate sm:inline">
                {profile?.full_name || user.email?.split("@")[0] || "User"}
              </span>
            </Link>
            <Button to="/dashboard">Dashboard</Button>
          </>
        ) : (
          <Button to="/dashboard">Get Started</Button>
        )}
      </div>
    </nav>
  )
}
