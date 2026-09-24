import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  Plus,
  Target,
} from 'lucide-react'

import Card from '../common/Card'
import ScoreRing, { ScoreBar } from './ScoreRing'

const IMPORTANCE_STYLE = {
  critical: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  important: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  'nice-to-have': 'border-gray-200 bg-gray-100 text-gray-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-400',
}

const SEVERITY_STYLE = {
  high: { ring: 'border-rose-500/25', icon: 'text-rose-600 dark:text-rose-400', Icon: AlertTriangle },
  medium: { ring: 'border-amber-500/25', icon: 'text-amber-600 dark:text-amber-400', Icon: Info },
  low: { ring: 'border-gray-200 dark:border-white/[0.08]', icon: 'text-gray-500 dark:text-gray-400', Icon: Lightbulb },
}

const BREAKDOWN_LABELS = {
  keyword_match: 'Keyword match',
  experience_relevance: 'Experience relevance',
  skills_coverage: 'Skills coverage',
  formatting: 'Formatting',
  section_structure: 'Section structure',
}

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 }

export default function AnalysisReport({ analysis, onAddKeyword }) {
  const [showAllMatched, setShowAllMatched] = useState(false)

  const matched = analysis.matched_keywords || []
  const missing = analysis.missing_keywords || []
  const visibleMatched = showAllMatched ? matched : matched.slice(0, 12)

  const suggestions = [...(analysis.suggestions || [])].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3),
  )

  return (
    <div className="space-y-5">

      {/* Scores */}
      <Card>
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
          <div className="flex shrink-0 gap-6">
            <ScoreRing score={analysis.overall_score} label="Overall" />
            <ScoreRing score={analysis.ats_score} label="ATS" sublabel="Machine readability" size={132} />
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            {analysis.score_reasoning && (
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {analysis.score_reasoning}
              </p>
            )}

            <div className="space-y-2.5">
              {Object.entries(BREAKDOWN_LABELS).map(([key, label]) => (
                <ScoreBar key={key} label={label} score={analysis.breakdown?.[key] ?? 0} />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Missing keywords — the most actionable output, so it leads */}
      {missing.length > 0 && (
        <Card
          title="Missing keywords"
          subtitle={`${missing.length} term${missing.length === 1 ? '' : 's'} this job asks for that your resume doesn't mention`}
        >
          <ul className="space-y-2">
            {missing.map((item, i) => (
              <li
                key={`${item.keyword}-${i}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.02]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.keyword}
                    </span>
                    <span
                      className={`rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${
                        IMPORTANCE_STYLE[item.importance] || IMPORTANCE_STYLE['nice-to-have']
                      }`}
                    >
                      {item.importance}
                    </span>
                  </div>

                  {item.reason && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-white/35">{item.reason}</p>
                  )}
                </div>

                {onAddKeyword && (
                  <button
                    type="button"
                    onClick={() => onAddKeyword(item.keyword)}
                    title="Add to your profile skills"
                    className="flex shrink-0 items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[11px] text-gray-600 transition-colors hover:border-violet-400 hover:text-violet-600 dark:border-white/[0.08] dark:text-gray-400 dark:hover:border-violet-400/50 dark:hover:text-violet-400"
                  >
                    <Plus className="h-3 w-3" />
                    Skill
                  </button>
                )}
              </li>
            ))}
          </ul>

          <p className="mt-3 text-[11px] leading-relaxed text-gray-400 dark:text-white/25">
            Only add a keyword if it is genuinely true of you. A term you can't
            speak to in an interview costs more than it gains.
          </p>
        </Card>
      )}

      {/* Matched keywords */}
      {matched.length > 0 && (
        <Card
          title="Matched keywords"
          subtitle={`${matched.length} term${matched.length === 1 ? '' : 's'} already in your resume`}
        >
          <div className="flex flex-wrap gap-2">
            {visibleMatched.map((item, i) => (
              <span
                key={`${item.keyword}-${i}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
              >
                <CheckCircle2 className="h-3 w-3" />
                {item.keyword}
                {item.count > 1 && (
                  <span className="text-[10px] opacity-60">×{item.count}</span>
                )}
              </span>
            ))}
          </div>

          {matched.length > 12 && (
            <button
              type="button"
              onClick={() => setShowAllMatched((v) => !v)}
              className="mt-3 text-xs text-violet-600 transition-colors hover:text-violet-500 dark:text-violet-400"
            >
              {showAllMatched ? 'Show fewer' : `Show all ${matched.length}`}
            </button>
          )}
        </Card>
      )}

      {/* Missing skills + recommended */}
      {(analysis.missing_skills?.length > 0 || analysis.recommended_keywords?.length > 0) && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {analysis.missing_skills?.length > 0 && (
            <Card title="Skill gaps" subtitle="Capabilities the role expects">
              <ul className="space-y-1.5">
                {analysis.missing_skills.map((skill, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                    {skill}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {analysis.recommended_keywords?.length > 0 && (
            <Card title="Worth adding" subtitle="Adjacent terms, if they're true of you">
              <div className="flex flex-wrap gap-2">
                {analysis.recommended_keywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-gray-400"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Experience relevance */}
      {analysis.experience_relevance_note && (
        <Card title="Experience relevance">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {analysis.experience_relevance_note}
          </p>
        </Card>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card
          title="What to fix"
          subtitle={`${suggestions.length} specific change${suggestions.length === 1 ? '' : 's'}, most important first`}
        >
          <ol className="space-y-3">
            {suggestions.map((s, i) => {
              const style = SEVERITY_STYLE[s.severity] || SEVERITY_STYLE.low
              const { Icon } = style

              return (
                <li
                  key={i}
                  className={`rounded-lg border bg-gray-50 p-3.5 dark:bg-white/[0.02] ${style.ring}`}
                >
                  <div className="mb-1.5 flex items-center gap-2">
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${style.icon}`} />
                    <span className="text-[10px] font-medium uppercase tracking-widest text-gray-500 dark:text-white/35">
                      {s.section} · {s.severity}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300">{s.issue}</p>
                  <p className="mt-1.5 border-l-2 border-violet-500/40 pl-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {s.fix}
                  </p>
                </li>
              )
            })}
          </ol>
        </Card>
      )}
    </div>
  )
}
