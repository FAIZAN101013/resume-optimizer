import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import StatsGrid from '../components/dashboard/StatsGrid'
import QuickActions from '../components/dashboard/QuickActions'
import RecentJobs from '../components/dashboard/RecentJobs'

export default function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) console.error(error)
      else setJobs(data)
      setLoading(false)
    }
    fetchJobs()
  }, [])

  const counts = {
    Applied:   jobs.filter(j => j.status === 'Applied').length,
    Interview: jobs.filter(j => j.status === 'Interview').length,
    Offer:     jobs.filter(j => j.status === 'Offer').length,
    Rejected:  jobs.filter(j => j.status === 'Rejected').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <DashboardHeader />
      <StatsGrid counts={counts} />
      <QuickActions jobCount={jobs.length} />
      <RecentJobs jobs={jobs.slice(0, 5)} />
    </div>
  )
} 