import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const [showSidebar, setShowSidebar] = useState(!isHome)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isHome) {
      setTimeout(() => setShowSidebar(true), 10)
    } else {
      setShowSidebar(false)
    }
  }, [isHome])
  
  useEffect(() => {
  setMobileOpen(false)
}, [pathname])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">

      {/* Mobile Overlay */}
      {!isHome && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!isHome && (
        <div
          className={`
            fixed top-0 left-0 h-screen z-50
            transition-all duration-300 ease-in-out
            ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            ${showSidebar ? 'w-56 opacity-100' : 'w-0 opacity-0'}
          `}
        >
          <Sidebar />
        </div>
      )}

      {/* Main */}
      <div className={`flex-1 flex flex-col min-w-0 ${!isHome ? 'lg:ml-56' : ''}`}>

        {isHome ? (
          <Navbar />
        ) : (
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/[0.06]">
            <button onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5 text-gray-300" />
            </button>
            <span className="text-sm font-semibold">CareerOS</span>
            <div className="w-5" />
          </div>
        )}

        <main className={`flex-1 ${!isHome ? 'p-4 sm:p-6 lg:p-8' : ''}`}>
          {children}
        </main>
      </div>

      {/* Close Button */}
      {!isHome && mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="fixed top-4 right-4 z-50 lg:hidden"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  )
}