import { Routes, Route } from 'react-router-dom'

import Layout from '../Layout'

import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import Tracker from '../pages/Tracker'
import Optimizer from '../pages/Optimizer'

import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <PublicRoute>
              <Home />
            </PublicRoute>
          </Layout>
        }
      />

      <Route
        path="/login"
        element={
          <Layout>
            <PublicRoute>
              <Login />
            </PublicRoute>
          </Layout>
        }
      />

      <Route
        path="/register"
        element={
          <Layout>
            <PublicRoute>
              <Register />
            </PublicRoute>
          </Layout>
        }
      />

      <Route
        path="/dashboard"
        element={
          <Layout>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Layout>
        }
      />

      <Route
        path="/tracker"
        element={
          <Layout>
            <ProtectedRoute>
              <Tracker />
            </ProtectedRoute>
          </Layout>
        }
      />

      <Route
        path="/optimizer"
        element={
          <Layout>
            <ProtectedRoute>
              <Optimizer />
            </ProtectedRoute>
          </Layout>
        }
      />
    </Routes>
  )
}