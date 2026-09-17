import { MapPin, Trash2 } from "lucide-react";
import { STATUS_BADGE } from "../../lib/constants";

export default function JobCard({ job, isStale, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.1] dark:hover:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between"
    >
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-700 dark:bg-white/[0.06] dark:text-gray-300">
          {(job.company || "?")[0].toUpperCase()}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-200">
              {job.company}
            </span>

            {job.priority === "High" && (
              <span className="shrink-0 rounded-full border border-orange-500/20 bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-orange-700 dark:text-orange-400">
                High
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-2 text-xs text-gray-500 dark:text-gray-600">
            <span className="truncate">{job.title}</span>

            {job.location && (
              <span className="flex items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5" strokeWidth={2} />
                {job.location}
              </span>
            )}

            {job.work_type && <span>· {job.work_type}</span>}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-3 self-end sm:self-auto">
        {isStale && (
          <span className="animate-pulse rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-700 dark:text-amber-400">
            Follow up
          </span>
        )}

        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${STATUS_BADGE[job.status]}`}
        >
          {job.status}
        </span>

        <span className="text-xs text-gray-500 dark:text-gray-600 sm:w-20 sm:text-right">
          {job.application_date || "—"}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(job);
          }}
          aria-label={`Delete application at ${job.company}`}
          className="rounded-md p-1 text-gray-400 transition-all duration-150 hover:bg-rose-500/10 hover:text-rose-600 dark:text-gray-700 dark:hover:text-rose-400 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
