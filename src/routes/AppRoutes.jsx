import { Routes, Route } from 'react-router-dom'

import Layout from '../Layout'

import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import Tracker from '../pages/Tracker'
import Optimizer from '../pages/Optimizer'
import Assistant from '../pages/Assistant'
import Interviews from '../pages/Interviews'
import Analytics from '../pages/Analytics'
import Profile from '../pages/Profile'
import Settings from '../pages/Settings'

import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

const PUBLIC_ROUTES = [
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
]

const PRIVATE_ROUTES = [
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/tracker', element: <Tracker /> },
  { path: '/optimizer', element: <Optimizer /> },
  { path: '/assistant', element: <Assistant /> },
  { path: '/interviews', element: <Interviews /> },
  { path: '/analytics', element: <Analytics /> },
  { path: '/profile', element: <Profile /> },
  { path: '/settings', element: <Settings /> },
]

export default function AppRoutes() {
  return (
    <Routes>
      {PUBLIC_ROUTES.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <Layout>
              <PublicRoute>{element}</PublicRoute>
            </Layout>
          }
        />
      ))}

      {PRIVATE_ROUTES.map(({ path, element }) => (
        <Route
          key={path}
          path={path}
          element={
            <Layout>
              <ProtectedRoute>{element}</ProtectedRoute>
            </Layout>
          }
        />
      ))}
    </Routes>
  )
}
