import { useCallback, useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'

import { listJobs, listRecentActivities } from '../services/jobService'
import { listUpcomingInterviews } from '../services/interviewService'
import { statusCounts, appliedJobs } from '../lib/analytics'

import DashboardHeader from '../components/dashboard/DashboardHeader'
import StatsGrid from '../components/dashboard/StatsGrid'
import QuickActions from '../components/dashboard/QuickActions'
import RecentJobs from '../components/dashboard/RecentJobs'
import UpcomingEvents from '../components/dashboard/UpcomingEvents'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import ThemeToggle from '../components/ThemeToggle'

export default function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [interviews, setInterviews] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      // One failure shouldn't blank the whole dashboard, so each source is
      // settled independently.
      const [jobsResult, interviewsResult, activityResult] = await Promise.allSettled([
        listJobs(),
        listUpcomingInterviews(4),
        listRecentActivities(8),
      ])

      if (jobsResult.status === 'fulfilled') setJobs(jobsResult.value)
      if (interviewsResult.status === 'fulfilled') setInterviews(interviewsResult.value)
      if (activityResult.status === 'fulfilled') setActivities(activityResult.value)

      const failed = [jobsResult, interviewsResult, activityResult].find(
        (r) => r.status === 'rejected',
      )
      if (failed) {
        console.error(failed.reason)
        setError('Some of your dashboard could not be loaded.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
      </div>
    )
  }

  const counts = statusCounts(jobs)
  const totalApplied = appliedJobs(jobs).length

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-2 flex items-start justify-between gap-4">
        <DashboardHeader />
        <ThemeToggle />
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <StatsGrid counts={counts} total={totalApplied} />

      <QuickActions />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RecentJobs jobs={jobs.slice(0, 5)} />
        <UpcomingEvents interviews={interviews} />
      </div>

      <div className="mt-5">
        <ActivityFeed activities={activities} />
      </div>
    </div>
  )
}
