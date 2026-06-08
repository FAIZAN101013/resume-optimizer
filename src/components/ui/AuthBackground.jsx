export default function AuthBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">

      {/* Light mode grid — subtle dark lines, mirrors the dark grid weight */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Dark mode grid — original, unchanged */}
      <div
        className="absolute inset-0 opacity-[0.03] hidden dark:block"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/8 via-transparent to-pink-500/8 dark:from-violet-500/10 dark:to-pink-500/10" />

      {/* Glows — slightly softer in light, original strength in dark */}
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-500/18 dark:bg-violet-500/25 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-120px] right-1/3 w-[400px] h-[400px] bg-pink-500/14 dark:bg-pink-500/20 rounded-full blur-[140px]" />
      <div className="absolute top-1/2 left-[-100px] w-[300px] h-[300px] bg-indigo-500/7 dark:bg-indigo-500/10 rounded-full blur-[100px]" />
    </div>
  )
}
