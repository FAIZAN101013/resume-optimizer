import { Link2, AlertCircle } from 'lucide-react'

import Card from '../common/Card'
import { fieldClasses, Input } from '../common/Field'

// This is the join between the tracker and the optimizer: picking a tracked
// job pulls its stored description in, which is what makes the modules feel
// like one product rather than separate tools.
export default function JobTargetPanel({
  jobs,
  selectedJobId,
  onSelectJob,
  jobDescription,
  onJobDescriptionChange,
  targetRole,
  onTargetRoleChange,
}) {
  const withDescription = jobs.filter((j) => j.description?.trim())
  const selected = jobs.find((j) => j.id === selectedJobId)

  return (
    <Card
      title="Target job"
      subtitle="Pick a tracked application or paste a description"
      action={
        <span className="shrink-0 text-[11px] tabular-nums text-gray-400 dark:text-white/25">
          {jobDescription.length.toLocaleString()} chars
        </span>
      }
    >
      <div className="space-y-3">
        {jobs.length > 0 && (
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-gray-500 dark:text-white/35">
              <Link2 className="h-3 w-3" />
              From your tracker
            </div>

            <select
              value={selectedJobId || ''}
              onChange={(e) => onSelectJob(e.target.value || null)}
              className={fieldClasses}
            >
              <option value="">Not linked to a tracked job</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id} disabled={!job.description?.trim()}>
                  {job.title} — {job.company}
                  {job.description?.trim() ? '' : ' (no description saved)'}
                </option>
              ))}
            </select>

            {jobs.length > 0 && withDescription.length === 0 && (
              <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-600 dark:text-amber-400/70">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                None of your tracked jobs have a description saved. Add one in
                the Job Tracker and it will appear here automatically.
              </p>
            )}

            {selected && (
              <p className="mt-2 text-[11px] text-gray-400 dark:text-white/25">
                Analysing against <strong className="font-medium">{selected.title}</strong> at{' '}
                {selected.company}. The result is saved to this application.
              </p>
            )}
          </div>
        )}

        <Input
          label="Target role"
          hint="Optional"
          name="target_role"
          value={targetRole}
          onChange={(e) => onTargetRoleChange(e.target.value)}
          placeholder="Frontend Developer"
        />

        <div>
          <div className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-gray-500 dark:text-white/35">
            Job description
          </div>

          <textarea
            rows={12}
            value={jobDescription}
            onChange={(e) => onJobDescriptionChange(e.target.value)}
            placeholder="Paste the full job description — requirements, responsibilities, qualifications…"
            className={`${fieldClasses} resize-none leading-relaxed scrollbar-none`}
          />
        </div>
      </div>
    </Card>
  )
}
