import { scoreTone } from '../../lib/scores'

export default function ScoreRing({ score = 0, size = 132, label = 'Overall', sublabel }) {
  const stroke = 9
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const tone = scoreTone(score)

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            className="stroke-gray-200 dark:stroke-white/[0.07]"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke={tone.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold tabular-nums ${tone.text}`}>{score}</span>
          <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-white/25">
            / 100
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
      <p className={`text-xs ${tone.text}`}>{sublabel || tone.label}</p>
    </div>
  )
}

export function ScoreBar({ label, score }) {
  const tone = scoreTone(score)

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
        <span className={`text-xs font-semibold tabular-nums ${tone.text}`}>{score}</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: tone.stroke }}
        />
      </div>
    </div>
  )
}
