export default function UpcomingEvents({ jobs }) {
  const upcomingInterviews = jobs
    .filter(job => job.status === "Interview")
    .slice(0, 3)

  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Upcoming Events
          </h2>

          <p className="text-sm text-gray-400">
            Stay on top of your job search.
          </p>
        </div>
      </div>

      {upcomingInterviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">
            📅
          </div>

          <p className="text-gray-400">
            No upcoming interviews scheduled.
          </p>

          <p className="text-sm text-gray-500 mt-2">
            Interviews will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {upcomingInterviews.map(job => (
            <div
              key={job.id}
              className="flex items-center justify-between rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4"
            >
              <div>
                <p className="font-medium text-white">
                  {job.job_title}
                </p>

                <p className="text-sm text-gray-400">
                  {job.company_name}
                </p>
              </div>

              <span className="rounded-full bg-yellow-500/15 px-3 py-1 text-xs font-medium text-yellow-400">
                Interview
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}