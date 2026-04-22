import { useState } from 'react'
import { initialJobs } from '../data/jobData'
import Button from '../components/Button'

const Tracker = () => {

  // ✅ MUST be inside component
  const [jobs, setJobs] = useState(initialJobs)

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
     <div className="flex items-center justify-between mb-6">
  <h1 className="text-2xl font-bold">Job Tracker</h1>

  <Button>+ Add Job</Button>
</div>
      {/* Job List */}
      <div className="space-y-3">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-semibold">{job.company}</div>
                <div className="text-sm text-gray-500">{job.role}</div>
              </div>

              <div className="text-sm text-gray-400">
                {job.status}
              </div>
            </div>

            <div className="text-xs text-gray-600 mt-2">
              {job.date}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Tracker