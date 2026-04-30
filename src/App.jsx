import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Optimizer from './pages/Optimizer'
import Tracker from './pages/Tracker'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/register" element={<Layout><Register /></Layout>} />
        <Route path="/dashboard" element={
          <Layout><ProtectedRoute><Dashboard /></ProtectedRoute></Layout>
        } />
        <Route path="/optimizer" element={
          <Layout><ProtectedRoute><Optimizer /></ProtectedRoute></Layout>
        } />
        <Route path="/tracker" element={
          <Layout><ProtectedRoute><Tracker /></ProtectedRoute></Layout>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App