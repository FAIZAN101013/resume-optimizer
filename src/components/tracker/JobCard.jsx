const STATUS_BADGE = {
  Applied: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  Interview: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Offer: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Rejected: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default function JobCard({ job, isStale, onClick, onDelete }) {
  return (
    <div
      onClick={onClick}
      className="group p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.03] transition-all duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer"
    >
      {/* Left */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center text-sm font-bold text-gray-300 flex-shrink-0">
          {job.company[0]}
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-200">
            {job.company}
          </div>
          <div className="text-xs text-gray-600">{job.role}</div>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
        <span
          className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${STATUS_BADGE[job.status]}`}
        >
          {job.status}
        </span>
        {isStale && (
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 ml-2 animate-pulse">
            Follow up
          </span>
        )}
        <span className="text-xs text-gray-600 text-xs text-gray-600 sm:w-14 sm:text-right">
          {job.date}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(job.id);
          }}
          className="text-gray-700 hover:text-rose-400 transition-all duration-150 text-lg leading-none sm:opacity-0 sm:group-hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  );
}
