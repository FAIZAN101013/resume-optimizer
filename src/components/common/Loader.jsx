import { useId } from 'react'

const SIZES = {
  xs: 14,
  sm: 18,
  md: 24,
  lg: 36,
}

/**
 * Brand spinner: an arc in the purple-to-cyan gradient.
 *
 * The gradient id has to be unique per instance — two SVGs sharing one id
 * means the second silently reuses the first one's gradient, and if the first
 * unmounts the survivor loses its stroke entirely.
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

      {/* Track */}
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth="5"
        className="stroke-gray-200 dark:stroke-white/[0.08]"
      />

      {/* Arc — roughly three quarters, so rotation is legible */}
      <circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="94 126"
      />
    </svg>
  )
}

/** The J mark, drawn in the brand gradient. Shared by the page loader. */
export function BrandMark({ size = 44, className = '' }) {
  const id = useId()

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>

      <rect width="64" height="64" rx="15" fill={`url(#${id})`} />

      <path
        d="M23 17h9v20c0 7.7-5 12.5-12.6 12.5"
        fill="none"
        stroke="#fff"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38 30l10-10m0 0h-7.5m7.5 0v7.5"
        fill="none"
        stroke="#fff"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
    </svg>
  )
}

/**
 * Full-area loading state for a page or panel.
 *
 * `label` should say what is loading. "Loading…" tells the user nothing they
 * cannot already see.
 */
export function PageLoader({ label = 'Loading', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 py-20 ${className}`}>
      <div className="relative">
        <BrandMark size={44} className="animate-pulse" />

        {/* Halo, sized off the mark so the two stay concentric */}
        <div className="absolute -inset-3 -z-10 rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#06B6D4]/20 blur-xl" />
      </div>

      <div className="flex items-center gap-2">
        <Loader size="xs" />
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      </div>
    </div>
  )
}

/**
 * Covers the whole viewport. Used while auth resolves, before any layout
 * exists to put a smaller loader inside.
 */
export function FullScreenLoader({ label = 'Starting JoBz' }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-white dark:bg-[#0a0a0f]">
      <div className="relative">
        <BrandMark size={56} className="animate-pulse" />
        <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-[#7C3AED]/25 to-[#06B6D4]/25 blur-2xl" />
      </div>

      <div className="text-center">
        <p className="text-lg font-bold text-gray-900 dark:text-white">JोBz</p>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-gray-400 dark:text-white/30">
          Track • Apply • Grow
        </p>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Loader size="xs" />
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
    </div>
  )
}
