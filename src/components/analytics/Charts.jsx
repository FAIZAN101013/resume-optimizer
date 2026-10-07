import { useState } from 'react'

// Every chart here plots ONE measure. Magnitude is encoded by bar length and
// identity by a direct label, so there is no categorical palette to get wrong
// — a single brand hue is correct and colourblind-safe by construction.
//
// Mark specs: 4px rounded data-ends anchored to the baseline, a 2px gap
// between adjacent bars, recessive axes, hover tooltip on every mark.

const BAR = 'fill-violet-600 dark:fill-violet-500'
const BAR_HOVER = 'fill-violet-700 dark:fill-violet-400'
const TRACK = 'fill-gray-100 dark:fill-white/[0.05]'

function Tooltip({ children }) {
  return (
    <div className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium whitespace-nowrap text-gray-900 shadow-lg dark:border-white/[0.1] dark:bg-[#13131c] dark:text-white">
      {children}
    </div>
  )
}

/** Vertical bars for a time series (applications per week / month). */
export function TimeBars({ data, height = 160, unit = 'application' }) {
  const [hover, setHover] = useState(null)

  const max = Math.max(...data.map((d) => d.count), 1)
  const gap = 2
  const slot = 100 / data.length

  const total = data.reduce((sum, d) => sum + d.count, 0)

  if (total === 0) {
    return (
      <p className="py-12 text-center text-xs text-gray-400 dark:text-white/25">
        No applications in this period yet.
      </p>
    )
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
        aria-label={`${unit}s over time, ${total} total`}
      >
        {/* Recessive baseline */}
        <line
          x1="0" y1={height - 0.5} x2="100" y2={height - 0.5}
          className="stroke-gray-200 dark:stroke-white/[0.08]"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />

        {data.map((d, i) => {
          const barH = d.count === 0 ? 0 : Math.max((d.count / max) * (height - 16), 3)
          const w = slot - gap
          const x = i * slot + gap / 2

          return (
            <g key={i}>
              {/* Full-height hit target — bigger than the mark */}
              <rect
                x={x} y={0} width={w} height={height}
                className="fill-transparent"
                onMouseEnter={() => setHover({ i, d })}
                onMouseLeave={() => setHover(null)}
              />
              <rect
                x={x}
                y={height - barH}
                width={w}
                height={barH}
                rx="1.5"
                className={`${hover?.i === i ? BAR_HOVER : BAR} pointer-events-none transition-all`}
              />
            </g>
          )
        })}
      </svg>

      {hover && (
        <div
          className="absolute top-0"
          style={{ left: `${(hover.i + 0.5) * slot}%` }}
        >
          <Tooltip>
            {hover.d.count} {unit}{hover.d.count === 1 ? '' : 's'} · {hover.d.label}
          </Tooltip>
        </div>
      )}

      {/* Selective labels only — never one per bar */}
      <div className="mt-2 flex justify-between text-[10px] text-gray-400 dark:text-white/25">
        <span>{data[0]?.label}</span>
        {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.label}</span>}
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  )
}

/** Horizontal ranked bars, for breakdowns with long labels. */
export function RankedBars({ data, emptyLabel = 'Nothing to show yet.' }) {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-xs text-gray-400 dark:text-white/25">
        {emptyLabel}
      </p>
    )
  }

  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <ul className="space-y-2.5">
      {data.map((d) => (
        <li key={d.label} className="group">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="truncate text-xs text-gray-700 dark:text-gray-300">{d.label}</span>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-gray-900 dark:text-white">
              {d.count}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.05]">
            <div
              className="h-full rounded-full bg-violet-600 transition-all duration-700 group-hover:bg-violet-700 dark:bg-violet-500 dark:group-hover:bg-violet-400"
              style={{ width: `${Math.max((d.count / max) * 100, 3)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

/**
 * Conversion funnel. Width is proportional to the top stage, so the drop-off
 * between stages is the thing you actually see.
 */
export function Funnel({ stages }) {
  const top = stages[0]?.value || 0

  if (!top) {
    return (
      <p className="py-10 text-center text-xs text-gray-400 dark:text-white/25">
        Apply to a few roles and your conversion funnel appears here.
      </p>
    )
  }

  return (
    <ol className="space-y-1">
      {stages.map((stage, i) => {
        const width = Math.max((stage.value / top) * 100, 4)
        const previous = i > 0 ? stages[i - 1].value : null
        const dropoff = previous ? previous - stage.value : null

        return (
          <li key={stage.label}>
            <div className="flex items-center gap-3">
              <div className="w-28 shrink-0 text-right text-xs text-gray-600 dark:text-gray-400">
                {stage.label}
              </div>

              <div className="min-w-0 flex-1">
                <div
                  className="flex h-9 items-center rounded-lg bg-violet-600 px-3 transition-all duration-700 dark:bg-violet-500"
                  style={{ width: `${width}%`, opacity: 1 - i * 0.13 }}
                >
                  <span className="text-sm font-semibold tabular-nums text-white">
                    {stage.value}
                  </span>
                </div>
              </div>

              <div className="w-12 shrink-0 text-xs tabular-nums text-gray-400 dark:text-white/25">
                {top ? Math.round((stage.value / top) * 100) : 0}%
              </div>
            </div>

            {/* Drop-off between stages — the number people actually want */}
            {dropoff !== null && dropoff > 0 && (
              <div className="ml-28 py-0.5 pl-3 text-[10px] text-gray-400 dark:text-white/20">
                ↓ {dropoff} didn't progress
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/**
 * A single headline number. Not a chart — one value doesn't need a plot.
 * Tone is carried by an icon and a label as well as colour.
 */
export function StatTile({ label, value, sublabel, icon: Icon, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-400',
    brand: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    good: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    critical: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.1]">
      {Icon && (
        <div className={`mb-3 flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
      )}

      <div className="mb-0.5 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
        {value}
      </div>

      <div className="text-xs font-medium text-gray-600 dark:text-gray-500">{label}</div>

      {sublabel && (
        <div className="mt-0.5 text-[11px] text-gray-400 dark:text-white/25">{sublabel}</div>
      )}
    </div>
  )
}
