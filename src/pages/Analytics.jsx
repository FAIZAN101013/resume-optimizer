import { useCallback, useEffect, useState } from 'react'
import {
  Briefcase,
  TrendingUp,
  Award,
  Clock,
  XCircle,
  AlertCircle,
  Table2,
} from 'lucide-react'

import Card from '../components/common/Card'
import Tabs from '../components/common/Tabs'
import ThemeToggle from '../components/ThemeToggle'
import { TimeBars, RankedBars, Funnel, StatTile } from '../components/analytics/Charts'

import { listJobs } from '../services/jobService'
import { listInterviews } from '../services/interviewService'
import {
  funnel,
  applicationsPerWeek,
  applicationsPerMonth,
  statusCounts,
  byCompany,
  bySource,
  byWorkType,
  averageDaysToInterview,
  openApplications,
  appliedJobs,
} from '../lib/analytics'
import { JOB_STATUSES } from '../lib/constants'

const RANGE_TABS = [
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
]

export default function Analytics() {
  const [jobs, setJobs] = useState([])
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState('weekly')
  const [showTable, setShowTable] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [jobList, interviewList] = await Promise.all([listJobs(), listInterviews()])
      setJobs(jobList)
      setInterviews(interviewList)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not load your analytics.')
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

  const f = funnel(jobs, interviews)
  const open = openApplications(jobs)
  const avgDays = averageDaysToInterview(jobs, interviews)
  const counts = statusCounts(jobs)
  const applied = appliedJobs(jobs)

  const timeData = range === 'weekly' ? applicationsPerWeek(jobs, 12) : applicationsPerMonth(jobs, 6)

  const statusRows = JOB_STATUSES
    .map((s) => ({ label: s, count: counts[s] }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)

  const funnelStages = [
    { label: 'Applications', value: f.total },
    { label: 'Interviews', value: f.reachedInterview },
    { label: 'Final rounds', value: f.finalRounds },
    { label: 'Offers', value: f.offers },
  ]

  const isEmpty = applied.length === 0

  return (
    <div className="mx-auto max-w-5xl">

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Career Analytics</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {isEmpty
              ? 'Add applications to see how your search is going'
              : `${f.total} application${f.total === 1 ? '' : 's'} analysed`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setShowTable((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-all hover:border-gray-300 hover:text-gray-900 dark:border-white/[0.08] dark:text-gray-400 dark:hover:border-white/20 dark:hover:text-white"
          >
            <Table2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            {showTable ? 'Hide table' : 'Table view'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {isEmpty ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center dark:border-white/[0.08]">
          <Briefcase className="mx-auto mb-3 h-8 w-8 opacity-30" strokeWidth={1.5} />
          <p className="text-sm text-gray-500 dark:text-gray-600">Nothing to analyse yet.</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-700">
            Applications you've actually sent show up here — saved jobs don't count.
          </p>
        </div>
      ) : (
        <div className="space-y-5">

          {/* Headline numbers */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              label="Applications sent"
              value={f.total}
              sublabel={`${open.count} still open`}
              icon={Briefcase}
              tone="brand"
            />
            <StatTile
              label="Interview rate"
              value={`${f.interviewRate}%`}
              sublabel={`${f.reachedInterview} reached interview`}
              icon={TrendingUp}
              tone="warning"
            />
            <StatTile
              label="Offer rate"
              value={`${f.offerRate}%`}
              sublabel={`${f.offers} offer${f.offers === 1 ? '' : 's'}`}
              icon={Award}
              tone="good"
            />
            <StatTile
              label="Days to interview"
              value={avgDays ?? '—'}
              sublabel={avgDays ? 'average, when scheduled' : 'no interviews scheduled yet'}
              icon={Clock}
              tone="neutral"
            />
          </div>

          {/* Funnel */}
          <Card
            title="Conversion funnel"
            subtitle="Where applications stop progressing"
          >
            <Funnel stages={funnelStages} />

            {f.reachedInterview > 0 && (
              <p className="mt-4 border-t border-gray-200 pt-3 text-xs text-gray-500 dark:border-white/[0.06] dark:text-white/35">
                {f.interviewToOfferRate}% of your interviews converted to an offer.
              </p>
            )}
          </Card>

          {/* Volume over time */}
          <Card
            title="Application volume"
            subtitle={range === 'weekly' ? 'Last 12 weeks' : 'Last 6 months'}
            action={
              <Tabs
                tabs={RANGE_TABS}
                active={range}
                onChange={setRange}
                className="border-b-0"
              />
            }
          >
            <TimeBars
              data={timeData}
              unit="application"
              height={range === 'weekly' ? 160 : 140}
            />
          </Card>

          {/* Breakdowns */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card title="By status" subtitle="Where everything currently sits">
              <RankedBars data={statusRows} />
            </Card>

            <Card title="By company" subtitle="Most-applied-to first">
              <RankedBars data={byCompany(jobs)} emptyLabel="No companies recorded." />
            </Card>

            <Card title="By source" subtitle="Where you found these roles">
              <RankedBars
                data={bySource(jobs)}
                emptyLabel="No sources recorded. Set one when adding a job."
              />
            </Card>

            <Card title="By work type" subtitle="On-site, hybrid or remote">
              <RankedBars
                data={byWorkType(jobs)}
                emptyLabel="No work types recorded."
              />
            </Card>
          </div>

          {/* Accessible fallback for every figure above */}
          {showTable && (
            <Card title="Table view" subtitle="Every figure on this page as numbers">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-widest text-gray-500 dark:border-white/[0.06] dark:text-white/35">
                      <th className="py-2 pr-4 font-medium">Metric</th>
                      <th className="py-2 font-medium">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                    {[
                      ['Applications sent', f.total],
                      ['Reached interview', `${f.reachedInterview} (${f.interviewRate}%)`],
                      ['Interviews scheduled', f.interviewCount],
                      ['Final rounds', f.finalRounds],
                      ['Offers', `${f.offers} (${f.offerRate}%)`],
                      ['Rejections', `${f.rejections} (${f.rejectionRate}%)`],
                      ['Interview → offer', `${f.interviewToOfferRate}%`],
                      ['Still open', open.count],
                      ['Median age of open applications', open.medianAgeDays != null ? `${open.medianAgeDays} days` : '—'],
                      ['Average days to interview', avgDays != null ? `${avgDays} days` : '—'],
                      ...statusRows.map((r) => [`Status: ${r.label}`, r.count]),
                      ...timeData.map((d) => [`${range === 'weekly' ? 'Week of' : 'Month'} ${d.label}`, d.count]),
                    ].map(([label, value]) => (
                      <tr key={label} className="text-gray-700 dark:text-gray-300">
                        <td className="py-2 pr-4">{label}</td>
                        <td className="py-2 font-medium tabular-nums">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
