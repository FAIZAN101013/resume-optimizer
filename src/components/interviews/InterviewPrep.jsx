import { useState } from 'react'
import { Sparkles, Save, ChevronDown, AlertCircle, Check } from 'lucide-react'

import Card from '../common/Card'
import { fieldClasses } from '../common/Field'
import { generateInterviewPrep } from '../../services/aiService'

const PRIORITY_STYLE = {
  high: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  medium: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  low: 'border-gray-200 bg-gray-100 text-gray-600 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-gray-400',
}

function QuestionGroup({ title, questions }) {
  const [open, setOpen] = useState(null)

  if (!questions?.length) return null

  return (
    <div>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-gray-500 dark:text-white/35">
        {title} · {questions.length}
      </p>

      <ul className="space-y-1.5">
        {questions.map((q, i) => (
          <li
            key={i}
            className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-white/[0.06] dark:bg-white/[0.02]"
          >
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-start gap-2 px-3 py-2.5 text-left"
            >
              <ChevronDown
                className={`mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform dark:text-white/30 ${
                  open === i ? 'rotate-180' : ''
                }`}
              />
              <span className="text-sm text-gray-800 dark:text-gray-200">{q.question}</span>
            </button>

            {open === i && (
              <div className="space-y-2 border-t border-gray-200 px-3 py-2.5 pl-8 dark:border-white/[0.06]">
                {q.why && (
                  <p className="text-xs text-gray-500 dark:text-white/40">
                    <span className="font-medium">Why it comes up:</span> {q.why}
                  </p>
                )}
                {q.approach && (
                  <p className="border-l-2 border-violet-500/40 pl-2.5 text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                    {q.approach}
                  </p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function InterviewPrep({ interview, jobDescription, candidateSkills, onSaveNotes }) {
  // Prep material persists on the interview row, so it survives a refresh.
  const [prep, setPrep] = useState(interview.prep_material?.technical ? interview.prep_material : null)
  const [notes, setNotes] = useState(interview.prep_notes || '')
  const [loading, setLoading] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    setError('')
    try {
      const result = await generateInterviewPrep({
        company: interview.company,
        position: interview.position,
        interviewType: interview.interview_type,
        jobDescription,
        candidateSkills,
      })

      setPrep(result)
      // Persist immediately — regenerating costs an API call.
      await onSaveNotes({ prep_material: result })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveNotes() {
    setSavingNotes(true)
    try {
      await onSaveNotes({ prep_notes: notes })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingNotes(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card
        title="Preparation material"
        subtitle={
          jobDescription
            ? 'Generated from the linked job description'
            : 'Generated from the role and company — link a tracked application for sharper questions'
        }
        action={
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-700 transition-all hover:bg-violet-500/15 disabled:opacity-50 dark:text-violet-300"
          >
            {loading ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border border-violet-400/40 border-t-violet-400" />
                Preparing…
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3" />
                {prep ? 'Regenerate' : 'Generate'}
              </>
            )}
          </button>
        }
      >
        {error && (
          <div className="mb-3 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        )}

        {!prep && !loading && (
          <p className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-xs leading-relaxed text-gray-400 dark:border-white/[0.08] dark:text-white/25">
            Generate likely questions, suggested answer structures, and topics to
            revise for this specific interview.
          </p>
        )}

        {prep && (
          <div className="space-y-5">
            {prep.topics?.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-gray-500 dark:text-white/35">
                  Revise first
                </p>
                <ul className="space-y-1.5">
                  {prep.topics.map((t, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-white/[0.06] dark:bg-white/[0.02]"
                    >
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {t.topic}
                        </span>
                        {t.detail && (
                          <p className="mt-0.5 text-xs text-gray-500 dark:text-white/35">{t.detail}</p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${
                          PRIORITY_STYLE[t.priority] || PRIORITY_STYLE.low
                        }`}
                      >
                        {t.priority}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <QuestionGroup title="Technical" questions={prep.technical} />
            <QuestionGroup title="Behavioural" questions={prep.behavioral} />
            <QuestionGroup title="HR & motivation" questions={prep.hr} />

            {prep.questions_to_ask?.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-gray-500 dark:text-white/35">
                  Ask them
                </p>
                <ul className="space-y-1.5">
                  {prep.questions_to_ask.map((q, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-white/[0.06] dark:bg-white/[0.02] dark:text-gray-300"
                    >
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Card>

      <Card
        title="Your prep notes"
        subtitle="Saved against this interview"
        action={
          <button
            type="button"
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900 disabled:opacity-50 dark:border-white/[0.08] dark:text-gray-400 dark:hover:text-white"
          >
            {saved ? <Check className="h-3 w-3 text-emerald-500" /> : <Save className="h-3 w-3" />}
            {saved ? 'Saved' : savingNotes ? 'Saving…' : 'Save'}
          </button>
        }
      >
        <textarea
          rows={8}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Your own answers, stories to tell, questions to ask, things to look up…"
          className={`${fieldClasses} resize-none leading-relaxed`}
        />
      </Card>
    </div>
  )
}
