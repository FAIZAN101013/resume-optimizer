import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Printer,
  Save,
  AlertCircle,
  Check,
  ZoomIn,
  ZoomOut,
  ShieldCheck,
  ShieldAlert,
  UserPen,
} from 'lucide-react'

import Button from '../components/Button'
import ThemeToggle from '../components/ThemeToggle'
import { useProfile } from '../context/ProfileContext'
import { useAuth } from '../context/AuthContext'
import { THEMES, getTheme } from '../components/builder/themes'
import { buildResumeDocument, documentGaps } from '../lib/resumeDocument'
import { createResume, listResumes, updateResume } from '../services/resumeService'

const ZOOM_STEPS = [0.5, 0.6, 0.7, 0.8, 0.9, 1]

export default function Builder() {
  const { profile, loading } = useProfile()
  const { user } = useAuth()

  const [themeKey, setThemeKey] = useState(
    () => localStorage.getItem('jobz:resume-theme') || 'classic',
  )
  const [zoom, setZoom] = useState(0.7)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const sheetRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('jobz:resume-theme', themeKey)
  }, [themeKey])

  // The resume is derived from the profile, so it can never disagree with it.
  const doc = useMemo(() => buildResumeDocument(profile, user), [profile, user])
  const gaps = useMemo(() => documentGaps(doc), [doc])

  const theme = getTheme(themeKey)
  const ThemeComponent = theme.component

  // Browser print produces a real PDF with selectable text, which is what ATS
  // software needs. An image-based export would score zero on every keyword.
  const handlePrint = useCallback(() => window.print(), [])

  async function handleSave() {
    setSaving(true)
    setError('')
    setNotice('')

    try {
      const name = `${doc.name || 'My'} — ${theme.name}`
      const existing = await listResumes()
      const match = existing.find((r) => r.name === name)

      const payload = {
        name,
        target_role: doc.headline,
        // Built from the profile, so there's no uploaded original to preserve.
        raw_text: toPlainText(doc),
        content: { built_from: 'profile', theme: themeKey, document: doc },
      }

      const saved = match
        ? await updateResume(match.id, payload)
        : await createResume(payload)

      setNotice(`Saved as "${saved.name}". It's in Resume Optimizer → Versions.`)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not save this resume.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500/30 border-t-violet-500" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Builder</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Built from your profile — edit there and it updates here
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="secondary" onClick={handleSave} disabled={saving}>
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving…' : 'Save version'}
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-3.5 w-3.5" />
            Download PDF
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {notice && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-300">
          <Check className="h-3.5 w-3.5 shrink-0" />
          {notice}
        </div>
      )}

      {gaps.length > 0 && (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-300">
          <span className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Your profile is missing {gaps.join(', ')}. The resume will print
            without those sections.
          </span>
          <Link
            to="/profile"
            className="flex shrink-0 items-center gap-1 whitespace-nowrap underline-offset-2 hover:underline"
          >
            <UserPen className="h-3 w-3" />
            Edit profile
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">

        {/* Theme picker */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-gray-500 dark:text-white/35">
            Template
          </p>

          <div className="space-y-2">
            {THEMES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setThemeKey(t.key)}
                className={`w-full rounded-lg border p-3 text-left transition-all ${
                  themeKey === t.key
                    ? 'border-violet-500/40 bg-violet-500/[0.08]'
                    : 'border-gray-200 bg-white hover:border-gray-300 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.1]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {t.name}
                  </span>

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

          <div className="mt-4 flex items-center gap-2 rounded-lg border border-gray-200 p-2 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => setZoom((z) => ZOOM_STEPS[Math.max(0, ZOOM_STEPS.indexOf(z) - 1)])}
              disabled={zoom === ZOOM_STEPS[0]}
              aria-label="Zoom out"
              className="rounded p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30 dark:hover:text-white"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>

            <span className="flex-1 text-center text-[11px] tabular-nums text-gray-500 dark:text-white/35">
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              onClick={() =>
                setZoom((z) => ZOOM_STEPS[Math.min(ZOOM_STEPS.length - 1, ZOOM_STEPS.indexOf(z) + 1)])
              }
              disabled={zoom === ZOOM_STEPS[ZOOM_STEPS.length - 1]}
              aria-label="Zoom in"
              className="rounded p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30 dark:hover:text-white"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-gray-400 dark:text-white/25">
            Download PDF opens your browser's print dialog. Choose
            <strong className="font-medium"> Save as PDF</strong> as the
            destination — the text stays selectable, which is what ATS software
            reads.
          </p>
        </aside>

        {/* Preview */}
        <div className="min-w-0 overflow-x-auto rounded-xl bg-gray-100 p-4 dark:bg-black/20 sm:p-8">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              // Reclaim the space scaling leaves behind, or the container
              // keeps a full-size gap below the preview.
              height: `calc(297mm * ${zoom})`,
            }}
            className="mx-auto w-[210mm]"
          >
            <div ref={sheetRef} className="resume-sheet shadow-xl">
              <ThemeComponent doc={doc} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Flat text of the document, so a built resume can still be analysed. */
function toPlainText(doc) {
  const parts = [
    doc.name,
    [doc.email, doc.phone, doc.location].filter(Boolean).join(' | '),
    doc.links.map((l) => l.href).join(' | '),
  ]

  if (doc.summary) parts.push(`\nSUMMARY\n${doc.summary}`)

  if (doc.experience.length) {
    parts.push('\nEXPERIENCE')
    for (const job of doc.experience) {
      parts.push(`${job.title} — ${job.company} (${job.range})`)
      parts.push(job.bullets.map((b) => `- ${b}`).join('\n'))
    }
  }

  if (doc.projects.length) {
    parts.push('\nPROJECTS')
    for (const project of doc.projects) {
      parts.push(`${project.name}${project.tech ? ` — ${project.tech}` : ''}`)
      parts.push(project.bullets.map((b) => `- ${b}`).join('\n'))
    }
  }

  if (doc.skills.length) parts.push(`\nSKILLS\n${doc.skills.join(', ')}`)

  if (doc.education.length) {
    parts.push('\nEDUCATION')
    for (const entry of doc.education) {
      parts.push(`${entry.degree} — ${entry.school} (${entry.range}) ${entry.grade}`.trim())
    }
  }

  if (doc.certifications.length) {
    parts.push('\nCERTIFICATIONS')
    for (const cert of doc.certifications) {
      parts.push([cert.name, cert.issuer, cert.date].filter(Boolean).join(' — '))
    }
  }

  return parts.filter(Boolean).join('\n')
}
