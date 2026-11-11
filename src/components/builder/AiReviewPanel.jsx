import { useState } from 'react'
import { Sparkles, Check, X, Copy, AlertCircle, Wand2 } from 'lucide-react'

import { reviewResume } from '../../services/aiService'
import { pathExists, setByPath } from '../../lib/resumeDocument'
import { scoreTone } from '../../lib/scores'

const SEVERITY = {
  high: 'border-l-rose-500',
  medium: 'border-l-amber-500',
  low: 'border-l-gray-300 dark:border-l-white/20',
}

export default function AiReviewPanel({ doc, onApply }) {
  const [review, setReview] = useState(null)
  const [handled, setHandled] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  async function runReview() {
    setLoading(true)
    setError('')
    try {
      const result = await reviewResume(doc)
      setReview(result)
      setHandled({})
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function applySuggestion(suggestion) {
    // Only replace when the path still resolves — the user may have edited or
    // deleted that entry since the review ran.
    if (suggestion.suggested_value && pathExists(doc, suggestion.field_path)) {
      onApply(setByPath(doc, suggestion.field_path, suggestion.suggested_value))
    }
    setHandled((h) => ({ ...h, [suggestion.id]: 'applied' }))
  }

  function copyValue(suggestion) {
    navigator.clipboard.writeText(suggestion.suggested_value || suggestion.message)
    setCopiedId(suggestion.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const open = (review?.suggestions || []).filter((s) => !handled[s.id])
  const tone = review ? scoreTone(review.overall.score) : null

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.06] dark:bg-white/[0.02]">

      <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-white/[0.06]">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">AI Review</h2>

        <button
          type="button"
          onClick={runReview}
          disabled={loading}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1.5 text-[11px] font-medium text-violet-700 transition-all hover:bg-violet-500/15 disabled:opacity-50 dark:text-violet-300"
        >
          {loading ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border border-violet-400/40 border-t-violet-400" />
              Reviewing…
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              {review ? 'Re-run' : 'Review'}
            </>
          )}
        </button>
      </div>

      <div className="max-h-[calc(100vh-14rem)] overflow-y-auto p-4 scrollbar-none">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        {!review && !loading && !error && (
          <p className="py-8 text-center text-xs leading-relaxed text-gray-400 dark:text-white/25">
            Get a critique of this resume on its own terms — weak bullets,
            missing outcomes, formatting. No job description needed.
          </p>
        )}

        {review && (
          <div className="space-y-3">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold tabular-nums ${tone.text}`}>
                  {review.overall.score}
                </span>
                <span className="text-[11px] text-gray-400 dark:text-white/25">/ 100</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                {review.overall.summary}
              </p>
            </div>

            {open.length === 0 ? (
              <p className="py-6 text-center text-xs text-emerald-600 dark:text-emerald-400">
                All suggestions handled.
              </p>
            ) : (
              open.map((s) => {
                const canApply = s.suggested_value && pathExists(doc, s.field_path)
                const stale = s.field_path && !pathExists(doc, s.field_path)

                return (
                  <div
                    key={s.id}
                    className={`rounded-lg border border-l-2 border-gray-200 bg-gray-50 p-3 dark:border-white/[0.06] dark:bg-white/[0.02] ${
                      SEVERITY[s.severity] || SEVERITY.low
                    }`}
                  >
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="text-[9px] font-medium uppercase tracking-widest text-gray-400 dark:text-white/25">
                        {s.section} · {s.severity}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                      {s.message}
                    </p>

                    {s.suggested_value && (
                      <div className="mt-2 space-y-1">
                        {s.current_value && (
                          <p className="rounded border border-gray-200 bg-white px-2 py-1 text-[11px] leading-relaxed text-gray-400 line-through dark:border-white/[0.06] dark:bg-transparent dark:text-white/25">
                            {s.current_value}
                          </p>
                        )}
                        <p className="rounded border border-violet-500/25 bg-violet-500/[0.06] px-2 py-1 text-[11px] leading-relaxed text-gray-800 dark:text-gray-200">
                          {s.suggested_value}
                        </p>
                      </div>
                    )}

                    {stale && (
                      <p className="mt-1.5 text-[10px] text-amber-600 dark:text-amber-400/70">
                        That entry has changed since the review — re-run to refresh.
                      </p>
                    )}

                    <div className="mt-2.5 flex items-center gap-1.5">
                      {canApply ? (
                        <button
                          type="button"
                          onClick={() => applySuggestion(s)}
                          className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-emerald-700"
                        >
                          <Wand2 className="h-2.5 w-2.5" />
                          Apply
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setHandled((h) => ({ ...h, [s.id]: 'done' }))}
                          className="flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-[10px] text-gray-600 transition-colors hover:text-gray-900 dark:border-white/[0.08] dark:text-gray-400 dark:hover:text-white"
                        >
                          <Check className="h-2.5 w-2.5" />
                          Done
                        </button>
                      )}

                      {s.suggested_value && (
                        <button
                          type="button"
                          onClick={() => copyValue(s)}
                          aria-label="Copy"
                          className="rounded-md border border-gray-200 p-1 text-gray-500 transition-colors hover:text-gray-900 dark:border-white/[0.08] dark:text-gray-400 dark:hover:text-white"
                        >
                          {copiedId === s.id ? (
                            <Check className="h-2.5 w-2.5 text-emerald-500" />
                          ) : (
                            <Copy className="h-2.5 w-2.5" />
                          )}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setHandled((h) => ({ ...h, [s.id]: 'dismissed' }))}
                        aria-label="Dismiss"
                        className="ml-auto rounded-md p-1 text-gray-400 transition-colors hover:text-gray-700 dark:text-white/25 dark:hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
