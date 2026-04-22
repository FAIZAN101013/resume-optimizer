import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Button from './Button'

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
      style={{ transform: "translateZ(0)" }} // 🔥 fixes flicker
      className={`px-8 flex items-center justify-between sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "py-3 bg-[#0a0a0f]/95 backdrop-blur-xl shadow-md shadow-black/40"
          : "py-4 bg-[#0a0a0f]"
      }`}
    >
      {/* Logo */}
      <Link
        to="/"
        className="font-semibold text-lg tracking-tight text-white hover:opacity-80 transition"
      >
        Career<span className="text-violet-400">OS</span>
      </Link>

      {/* CTA */}
      <Button to="/dashboard">Get Started →</Button>

      {/* 🔧 safety line (covers any 1px gap) */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#0a0a0f]" />
    </nav>
  )
}