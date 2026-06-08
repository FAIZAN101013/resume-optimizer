const AVATARS = [
  { initials: 'AK', bg: 'bg-violet-700' },
  { initials: 'JL', bg: 'bg-cyan-700' },
  { initials: 'SR', bg: 'bg-pink-700' },
  { initials: 'MT', bg: 'bg-emerald-900' },
]

export default function AvatarStack() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex">
        {AVATARS.map((av, i) => (
          <div
            key={av.initials}
            className={`w-7 h-7 rounded-full border-2 border-white dark:border-[#0a0a0f] flex items-center justify-center text-[9px] font-medium text-white ${av.bg} ${i > 0 ? '-ml-2' : ''}`}
          >
            {av.initials}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        <span className="text-gray-700 dark:text-gray-300 font-medium">2,400+ professionals</span> optimized their careers this month
      </p>
    </div>
  )
}
