import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Home from './pages/Home'
import Optimizer from './pages/Optimizer'
import Tracker from './pages/Tracker'
import Dashboard from './pages/Dashboard'

function Layout({ children }) {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  const [showSidebar, setShowSidebar] = useState(!isHome)

  useEffect(() => {
    if (!isHome) {
      setTimeout(() => setShowSidebar(true), 10)
    } else {
      setShowSidebar(false)
    }
  }, [isHome])

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      <div
        className="transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0"
        style={{ width: showSidebar ? '224px' : '0px', opacity: showSidebar ? 1 : 0 }}
      >
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {isHome && <Navbar />}
        <main className={`flex-1 ${!isHome ? 'p-8' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/optimizer" element={<Layout><Optimizer /></Layout>} />
        <Route path="/tracker" element={<Layout><Tracker /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App