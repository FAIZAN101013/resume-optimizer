export default function Section({ label, children }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-500 dark:text-white/35 tracking-widest uppercase mb-2">
        {label}
      </p>

      {children}
    </div>
  )
}