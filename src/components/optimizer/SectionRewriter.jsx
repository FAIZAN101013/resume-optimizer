import { useState } from 'react'
import { Sparkles, Check, X, RotateCcw, Copy, ShieldAlert } from 'lucide-react'

import Card from '../common/Card'
import { rewriteSection } from '../../services/aiService'

export default function SectionRewriter({
  section,
  label,
  content,
  jobDescription,
  targetRole,
  profile,
  onAccept,
}) {
  const [draft, setDraft] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const isCoverLetter = section === 'cover_letter'
  const canRun = isCoverLetter || !!content?.trim()

  async function handleRewrite() {
    setLoading(true)
    setError('')
    try {
      const result = await rewriteSection({
        section,
        content,
        jobDescription,
        targetRole,
        profile,
      })
      setDraft(result.rewritten)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleAccept() {
    onAccept(draft)
    setDraft(null)
  }

  function handleCopy() {
    navigator.clipboard.writeText(draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card
      title={label}
      subtitle={
        isCoverLetter
          ? 'Generated from your profile and the target job'
          : 'Rewritten for this job, without changing the facts'
      }
      action={
        <button
          type="button"
          onClick={handleRewrite}
          disabled={loading || !canRun}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-700 transition-all hover:bg-violet-500/15 disabled:cursor-not-allowed disabled:opacity-40 dark:text-violet-300"
        >
          {loading ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border border-violet-400/40 border-t-violet-400" />
              Writing…
            </>
          ) : (
            <>
              <Sparkles className="h-3 w-3" />
              {draft ? 'Try again' : 'Improve'}
            </>
          )}
        </button>
      }
    >
      {!canRun && (
        <p className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-xs text-gray-400 dark:border-white/[0.08] dark:text-white/25">
          Nothing in this section yet. Add content first, then improve it.
        </p>
      )}

      {error && (
        <div className="mb-3 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {canRun && !draft && !loading && (
        <pre className="max-h-52 overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 font-sans text-sm leading-relaxed text-gray-600 scrollbar-none dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-gray-400">
          {content || '—'}
        </pre>
      )}

      {draft && (
        <>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[10px] font-medium uppercase tracking-widest text-gray-500 dark:text-white/35">
                Original
              </p>
              <pre className="h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 font-sans text-sm leading-relaxed text-gray-500 scrollbar-none dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-white/35">
                {content || '(nothing yet)'}
              </pre>
            </div>

            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-violet-600 dark:text-violet-400">
                <Sparkles className="h-2.5 w-2.5" />
                Improved — editable
              </p>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="h-56 w-full resize-none rounded-lg border border-violet-500/25 bg-violet-500/[0.03] p-3 font-sans text-sm leading-relaxed text-gray-800 scrollbar-none focus:border-violet-400 focus:outline-none dark:text-gray-200"
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAccept}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
            >
              <Check className="h-3 w-3" />
              Accept
            </button>

            <button
              type="button"
              onClick={() => setDraft(null)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-white/[0.08] dark:text-gray-400 dark:hover:text-white"
            >
              <X className="h-3 w-3" />
              Discard
            </button>

            <button
              type="button"
              onClick={handleRewrite}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 disabled:opacity-50 dark:border-white/[0.08] dark:text-gray-400 dark:hover:text-white"
            >
              <RotateCcw className="h-3 w-3" />
              Regenerate
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-white/[0.08] dark:text-gray-400 dark:hover:text-white"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>

          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-600/80 dark:text-amber-400/60">
            <ShieldAlert className="mt-0.5 h-3 w-3 shrink-0" />
            Read this before accepting. The AI is instructed never to invent
            facts, but you are the one signing your name to it — check every
            claim is true, and fill in any [add: …] placeholders yourself.
          </p>
        </>
      )}
    </Card>
  )
}
