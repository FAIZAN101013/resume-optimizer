import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Printer,
  Save,
  AlertCircle,
  Check,
  LayoutTemplate,
  RotateCcw,
  Pencil,
  PanelRightClose,
  PanelRightOpen,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react'

import Button from '../components/Button'
import ThemeToggle from '../components/ThemeToggle'
import BuilderForm from '../components/builder/BuilderForm'
import AiReviewPanel from '../components/builder/AiReviewPanel'
import { THEMES, getTheme } from '../components/builder/themes'

import { useProfile } from '../context/ProfileContext'
import { useAuth } from '../context/AuthContext'
import { buildResumeDocument } from '../lib/resumeDocument'
import { createResume, listResumes, updateResume } from '../services/resumeService'

export default function Builder() {
  const { profile, loading } = useProfile()
  const { user } = useAuth()

  const [doc, setDoc] = useState(null)
  const [resumeId, setResumeId] = useState(null)
  const [resumeName, setResumeName] = useState('My Resume')
  const [renaming, setRenaming] = useState(false)

  const [themeKey, setThemeKey] = useState(
    () => localStorage.getItem('jobz:resume-theme') || 'classic',
  )
  const [showTemplates, setShowTemplates] = useState(false)
  const [showReview, setShowReview] = useState(true)

  // A4 at 96dpi. The sheet renders at full size and is scaled down to fit,
  // so the preview is never clipped regardless of column width.
  const A4_WIDTH = 794
  const A4_HEIGHT = 1123

  const previewRef = useRef(null)
  const [scale, setScale] = useState(0.6)

  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    localStorage.setItem('jobz:resume-theme', themeKey)
  }, [themeKey])

  // Measure rather than hardcode: a fixed scale overflows on narrow columns
  // and wastes space on wide ones.
  useEffect(() => {
    const el = previewRef.current
    if (!el) return

    const observer = new ResizeObserver(([entry]) => {
      const available = entry.contentRect.width
      setScale(Math.min(1, Math.max(0.28, available / A4_WIDTH)))
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Seed from the profile once. After that the document is the user's to edit
  // here — the profile is the starting point, not a live binding, or every
  // edit in the builder would be silently reverted.
  useEffect(() => {
    if (loading || doc) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDoc(buildResumeDocument(profile, user))
  }, [loading, profile, user, doc])

  const theme = getTheme(themeKey)
  const ThemeComponent = theme.component

  const handlePrint = useCallback(() => window.print(), [])

  function resetFromProfile() {
    setDoc(buildResumeDocument(profile, user))
    setNotice('Reloaded from your profile.')
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setNotice('')

    try {
      const payload = {
        name: resumeName.trim() || 'My Resume',
        target_role: doc.headline,
        raw_text: toPlainText(doc),
        content: { built_from: 'builder', theme: themeKey, document: doc },
      }

      let saved
      if (resumeId) {
        saved = await updateResume(resumeId, payload)
      } else {
        // Reuse a version with the same name rather than piling up duplicates.
        const existing = await listResumes()
        const match = existing.find((r) => r.name === payload.name)
        saved = match ? await updateResume(match.id, payload) : await createResume(payload)
      }

      setResumeId(saved.id)
      setSavedAt(new Date())
      setNotice(`Saved as "${saved.name}".`)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not save this resume.')
    } finally {
      setSaving(false)
    }
  }

  const gaps = useMemo(() => {
    if (!doc) return []
    const missing = []
    if (!doc.name) missing.push('a name')
    if (!doc.email) missing.push('an email')
    if (!doc.experience.length && !doc.projects.length) missing.push('experience or projects')
    return missing
  }, [doc])

  if (loading || !doc) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px]">

      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          {renaming ? (
            <input
              autoFocus
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              onBlur={() => setRenaming(false)}
              onKeyDown={(e) => e.key === 'Enter' && setRenaming(false)}
              className="rounded-lg border border-violet-400 bg-transparent px-2 py-1 text-2xl font-bold text-gray-900 focus:outline-none dark:text-white"
            />
          ) : (
            <>
              <h1 className="truncate text-2xl font-bold text-gray-900 dark:text-white">
                {resumeName}
              </h1>
              <button
                type="button"
                onClick={() => setRenaming(true)}
                aria-label="Rename resume"
                className="rounded p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {savedAt && (
            <span className="ml-1 shrink-0 text-[11px] text-gray-400 dark:text-white/25">
              Saved {savedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setShowTemplates((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-all hover:border-gray-300 hover:text-gray-900 dark:border-white/[0.08] dark:text-gray-400 dark:hover:text-white"
          >
            <LayoutTemplate className="h-3.5 w-3.5" strokeWidth={1.75} />
            {theme.name}
          </button>

          <button
            type="button"
            onClick={() => setShowReview((v) => !v)}
            aria-label={showReview ? 'Hide AI review' : 'Show AI review'}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-all hover:border-gray-300 hover:text-gray-900 dark:border-white/[0.08] dark:text-gray-400 dark:hover:text-white"
          >
            {showReview ? (
              <PanelRightClose className="h-3.5 w-3.5" strokeWidth={1.75} />
            ) : (
              <PanelRightOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
          </button>

          <Button variant="secondary" onClick={handleSave} disabled={saving}>
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving…' : 'Save'}
          </Button>

          <Button onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5" />
            Download
          </Button>
        </div>
      </div>

      {/* Template picker */}
      {showTemplates && (
        <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-white/[0.06] dark:bg-white/[0.02] lg:grid-cols-4">
          {THEMES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => { setThemeKey(t.key); setShowTemplates(false) }}
              className={`rounded-lg border p-3 text-left transition-all ${
                themeKey === t.key
                  ? 'border-violet-500/40 bg-violet-500/[0.08]'
                  : 'border-gray-200 hover:border-gray-300 dark:border-white/[0.06] dark:hover:border-white/[0.1]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{t.name}</span>
                {t.atsSafe ? (
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                ) : (
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                )}
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-gray-500 dark:text-white/35">
                {t.description}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {notice && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-300">
          <Check className="h-3.5 w-3.5 shrink-0" />
          {notice}
        </div>
      )}

      {gaps.length > 0 && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-300">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Still missing {gaps.join(' and ')}.
        </div>
      )}

      {/* edit | preview | review — three across only when there is genuinely
          room for an A4 page in the middle, two otherwise. */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(300px,340px)_1fr] 2xl:grid-cols-[minmax(300px,340px)_1fr_320px]">

        <div className="min-w-0 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-1 lg:scrollbar-none">
          <div className="mb-2 flex justify-end">
            <button
              type="button"
              onClick={resetFromProfile}
              className="flex items-center gap-1.5 text-[11px] text-gray-500 transition-colors hover:text-violet-600 dark:text-white/35 dark:hover:text-violet-400"
            >
              <RotateCcw className="h-3 w-3" strokeWidth={1.75} />
              Reload from profile
            </button>
          </div>

          <BuilderForm doc={doc} onChange={setDoc} />
        </div>

        {/* Preview */}
        <div
          ref={previewRef}
          className="min-w-0 overflow-hidden rounded-xl bg-gray-100 p-4 dark:bg-black/20"
        >
          <div
            className="mx-auto overflow-hidden"
            style={{ width: A4_WIDTH * scale, height: A4_HEIGHT * scale }}
          >
            <div
              className="origin-top-left"
              style={{ transform: `scale(${scale})`, width: A4_WIDTH }}
            >
              <div className="resume-sheet shadow-xl">
                <ThemeComponent doc={doc} />
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-[10px] text-gray-400 dark:text-white/25">
            {theme.name} · {Math.round(scale * 100)}% · A4
          </p>
        </div>

        {showReview && (
          <div className="min-w-0 lg:col-span-2 2xl:col-span-1">
            <div className="2xl:sticky 2xl:top-4">
              <AiReviewPanel doc={doc} onApply={setDoc} />
            </div>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-[11px] text-gray-400 dark:text-white/25">
        Download opens your browser's print dialog — choose
        <strong className="font-medium"> Save as PDF</strong>. The text stays
        selectable, which is what ATS software reads.
      </p>
    </div>
  )
}

/** Flat text of the document, so a built resume can still be analysed. */
function toPlainText(doc) {
  const parts = [
    doc.name,
    [doc.email, doc.phone, doc.location].filter(Boolean).join(' | '),
    doc.links.map((l) => l.href).filter(Boolean).join(' | '),
  ]

  if (doc.summary) parts.push(`\nSUMMARY\n${doc.summary}`)

  const block = (title, items, line, bullets) => {
    if (!items.length) return
    parts.push(`\n${title}`)
    for (const item of items) {
      parts.push(line(item))
      const list = bullets?.(item)
      if (list?.length) parts.push(list.map((b) => `- ${b}`).join('\n'))
    }
  }

  block('EXPERIENCE', doc.experience, (j) => `${j.title} — ${j.company} (${j.range})`, (j) => j.bullets)
  block('PROJECTS', doc.projects, (p) => `${p.name}${p.tech ? ` — ${p.tech}` : ''}`, (p) => p.bullets)
  block('EDUCATION', doc.education, (e) => `${e.degree} — ${e.school} (${e.range}) ${e.grade}`.trim())
  block('CERTIFICATIONS', doc.certifications, (c) => [c.name, c.issuer, c.date].filter(Boolean).join(' — '))

  if (doc.skills.length) parts.push(`\nSKILLS\n${doc.skills.join(', ')}`)

  return parts.filter(Boolean).join('\n')
}
