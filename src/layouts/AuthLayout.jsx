import AuthBackground from "../components/ui/AuthBackground"
import ThemeToggle from "../components/ThemeToggle"

export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-[#0a0a0f] text-gray-900 dark:text-white flex items-center justify-center px-4 overflow-hidden transition-colors duration-300">

      <AuthBackground />

      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      <div
        className="relative z-10 w-full max-w-sm"
        style={{ animation: "fadeUp 0.4s ease-out forwards" }}
      >
        {children}
      </div>

    </div>
  )
}
