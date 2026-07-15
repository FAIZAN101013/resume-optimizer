import { useState, useEffect } from 'react'
import { listJobs } from '../services/jobService'
import { JOB_STATUSES } from '../lib/constants'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import StatsGrid from '../components/dashboard/StatsGrid'
import QuickActions from '../components/dashboard/QuickActions'
import RecentJobs from '../components/dashboard/RecentJobs'
import ThemeToggle from '../components/ThemeToggle'


export default function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setJobs(await listJobs())
      } catch (err) {
        console.error(err)
        setError(err.message || 'Could not load your dashboard.')
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const counts = Object.fromEntries(
    JOB_STATUSES.map(s => [s, jobs.filter(j => j.status === s).length]),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-2">
        <DashboardHeader />
        <ThemeToggle />
      </div>
      {error && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      <StatsGrid counts={counts} />
     <QuickActions jobCount={jobs.length} />



<RecentJobs jobs={jobs.slice(0, 5)} />
    </div>
  )
} 