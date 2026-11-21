import { useId } from 'react'

const SIZES = { xs: 14, sm: 18, md: 24, lg: 32 }

/**
 * Brand spinner: a gradient arc.
 *
 * The gradient id must be unique per instance. SVG ids are global, so two
 * spinners sharing one means the second reuses the first's definition — and
 * loses its stroke entirely when that first instance unmounts.
 */
export default function Loader({ size = 'md', className = '' }) {
  const id = useId()
  const px = SIZES[size] || SIZES.md

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 50 50"
      className={`animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      <circle
        cx="25" cy="25" r="20"
        fill="none" strokeWidth="4"
        className="stroke-gray-200 dark:stroke-white/[0.08]"
      />
      <circle
        cx="25" cy="25" r="20"
        fill="none" stroke={`url(#${id})`} strokeWidth="4"
        strokeLinecap="round" strokeDasharray="80 126"
      />
    </svg>
  )
}

/**
 * In-page loading state. Deliberately just a spinner and a line of text —
 * a large mark and a glow drew more attention to the wait than to the app.
 */
export function PageLoader({ label = 'Loading', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-2.5 py-24 ${className}`}>
      <Loader size="sm" />
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  )
}

/**
 * Shown once, while the session resolves, before any layout exists. The
 * wordmark plus a thin indeterminate bar — enough to feel like the product,
 * quiet enough not to be a splash screen.
 */
export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white dark:bg-[#0a0a0f]">
      <div className="flex flex-col items-center gap-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Jo<span className="bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent">B</span>z
          </h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-gray-400 dark:text-white/25">
            Track • Apply • Grow
          </p>
        </div>

        {/* Indeterminate: there is no real progress to report, and a fake
            percentage would be worse than none. */}
        <div className="h-[2px] w-32 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
          <div className="loader-bar h-full w-1/2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]" />
        </div>
      </div>
    </div>
  )
}
