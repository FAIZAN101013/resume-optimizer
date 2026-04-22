import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Optimizer from './pages/Optimizer'
import Tracker from './pages/Tracker'

export default function App() {
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