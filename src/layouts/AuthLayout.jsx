import AuthBackground from "../components/ui/AuthBackground"

export default function AuthLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4 overflow-hidden">

      <AuthBackground />

      <div className="relative z-10 w-full max-w-sm">
        {children}
      </div>

    </div>
  )
}