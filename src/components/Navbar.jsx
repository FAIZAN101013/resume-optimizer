import { useEffect, useState } from 'react'
import Button from './Button'
import Logo from './Logo/Logo'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

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
        <Button to="/dashboard">Get Started →</Button>
      </div>
    </nav>
  )
}
