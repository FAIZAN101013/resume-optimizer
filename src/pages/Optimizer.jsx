import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Sparkles,
  Save,
  AlertCircle,
  Check,
  ScanSearch,
  Wand2,
  Layers,
} from 'lucide-react'

import ThemeToggle from '../components/ThemeToggle'
import Button from '../components/Button'
import Tabs from '../components/common/Tabs'
import ConfirmDialog from '../components/common/ConfirmDialog'

import ResumeSourcePanel from '../components/optimizer/ResumeSourcePanel'
import JobTargetPanel from '../components/optimizer/JobTargetPanel'
import AnalysisReport from '../components/optimizer/AnalysisReport'
import ResumeVersionList from '../components/optimizer/ResumeVersionList'
import SectionRewriter from '../components/optimizer/SectionRewriter'

import { listJobs, addActivity } from '../services/jobService'
import {
  listResumes,
  createResume,
  updateResume,
  deleteResume,
  duplicateResume,
  uploadResumeFile,
  getResumeDownloadUrl,
  saveAnalysis,
} from '../services/resumeService'
import { analyzeResume } from '../services/aiService'
import { useProfile } from '../context/ProfileContext'
import { parseResumeText, sectionsToText } from '../lib/resumeParser'
import { REWRITABLE_SECTIONS } from '../lib/constants'
import { useDraft } from '../hooks/useDraft'
import { takeResumeText } from '../lib/handoff'
import Modal from '../components/common/Modal'

const TABS = [
  { key: 'analyze', label: 'Analyse', icon: ScanSearch },
  { key: 'improve', label: 'Improve', icon: Wand2 },
  { key: 'versions', label: 'Versions', icon: Layers },
]

export default function Optimizer() {
  const { profile, saveProfile } = useProfile()
  const [, setSearchParams] = useSearchParams()

  // Read once at mount. Depending on live searchParams would re-run the load
  // effect every time the dropdown rewrites the URL, refetching everything and
  // overwriting any edits made to the job description.
  const [initialJobId] = useState(
    () => new URLSearchParams(window.location.search).get('job'),
  )

  const [tab, setTab] = useState('analyze')

  const [jobs, setJobs] = useState([])
  const [resumes, setResumes] = useState([])

  // Drafts, not component state: switching to the builder and back used to
  // discard a pasted resume and job description without warning.
  const [resumeText, setResumeText] = useDraft('optimizer:resume', '')
  const [jobDescription, setJobDescription] = useDraft('optimizer:jd', '')
  const [targetRole, setTargetRole] = useDraft('optimizer:role', '')
  const [selectedJobId, setSelectedJobId] = useDraft('optimizer:jobId', null)

  const [activeResume, setActiveResume] = useState(null)
  const [pendingFile, setPendingFile] = useState(null)

  const [analysis, setAnalysis] = useDraft('optimizer:analysis', null)
  const [showResults, setShowResults] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  /* ------------------------------------------------------------ data load */

  const loadData = useCallback(async () => {
    try {
      const [jobList, resumeList] = await Promise.all([listJobs(), listResumes()])
      setJobs(jobList)
      setResumes(resumeList)
      return jobList
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not load your data.')
      return []
    }
  }, [])

  useEffect(() => {
    // A resume handed over from the builder. Taking clears the stash, so it
    // only ever applies once and never overwrites later typing.
    const handed = takeResumeText()
    if (handed) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResumeText(handed)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotice('Loaded from the Resume Builder — pick a job to score it against.')
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData().then((jobList) => {
      // Deep link from the tracker: /optimizer?job=<id>
      if (!initialJobId) return

      const job = jobList.find((j) => j.id === initialJobId)
      if (!job) return

      setSelectedJobId(job.id)
      setJobDescription(job.description || '')
      setTargetRole(job.title || '')
    })
  }, [loadData, initialJobId])

  /* --------------------------------------------------------------- derived */

  const sections = useMemo(() => parseResumeText(resumeText), [resumeText])

  const canAnalyze =
    resumeText.trim().length >= 100 && jobDescription.trim().length >= 50 && !analyzing

  /* --------------------------------------------------------------- actions */

  function handleSelectJob(jobId) {
    setSelectedJobId(jobId)
    if (!jobId) return

    const job = jobs.find((j) => j.id === jobId)
    if (!job) return

    // Pulling the stored description in is the whole point of the link.
    setJobDescription(job.description || '')
    if (!targetRole) setTargetRole(job.title || '')

    setSearchParams(job.id ? { job: job.id } : {}, { replace: true })
  }

  function handleFileParsed(extractedText, file) {
    setResumeText(extractedText)
    // Held until save, so the original is only stored once the user commits.
    setPendingFile(file)
    setNotice(`Read ${extractedText.length.toLocaleString()} characters from ${file.name}.`)
  }

  async function handleAnalyze() {
    setAnalyzing(true)
    setError('')
    setNotice('')
    setAnalysis(null)

    try {
      const result = await analyzeResume({
        resumeText,
        jobDescription,
        targetRole: targetRole || undefined,
      })

      setAnalysis(result)
      setShowResults(true)

      // Persist only when there's a resume row to attach it to. Without one
      // the analysis is still shown — it just isn't part of the history yet.
      if (activeResume) {
        await saveAnalysis({
          resumeId: activeResume.id,
          jobId: selectedJobId,
          jobDescription,
          analysis: result,
        })

        const updated = await updateResume(activeResume.id, {
          ai_score: result.overall_score,
          target_job_description: jobDescription,
          target_role: targetRole,
          source_job_id: selectedJobId,
        })

        setActiveResume(updated)
        setResumes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      }

      if (selectedJobId) {
        // Shows up on the application's timeline.
        await addActivity(
          selectedJobId,
          'resume_optimized',
          `Resume analysed — scored ${result.overall_score}/100`,
          { overall_score: result.overall_score, ats_score: result.ats_score },
        ).catch(() => {})
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleSaveVersion() {
    setSaving(true)
    setError('')

    try {
      let fileMeta = {}

      if (pendingFile) {
        const uploaded = await uploadResumeFile(pendingFile)
        fileMeta = {
          file_url: uploaded.path,
          file_name: uploaded.fileName,
          file_type: uploaded.fileType,
        }
      }

      const payload = {
        name:
          targetRole?.trim()
            ? `${targetRole.trim()} resume`
            : pendingFile?.name || 'Untitled resume',
        target_role: targetRole,
        target_job_description: jobDescription,
        source_job_id: selectedJobId,
        // raw_text preserves what was extracted; content holds the editable
        // structured version, so the original is never destroyed.
        raw_text: resumeText,
        content: { personal: sections.personal, sections: sections.sections },
        ai_score: analysis?.overall_score ?? null,
        ...fileMeta,
      }

      const saved = activeResume
        ? await updateResume(activeResume.id, payload)
        : await createResume(payload)

      setActiveResume(saved)
      setResumes((prev) => {
        const exists = prev.some((r) => r.id === saved.id)
        return exists ? prev.map((r) => (r.id === saved.id ? saved : r)) : [saved, ...prev]
      })

      setPendingFile(null)
      setNotice(`Saved as "${saved.name}".`)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not save this version.')
    } finally {
      setSaving(false)
    }
  }

  function handleOpenResume(resume) {
    setActiveResume(resume)
    setResumeText(resume.raw_text || '')
    setTargetRole(resume.target_role || '')
    setJobDescription(resume.target_job_description || '')
    setSelectedJobId(resume.source_job_id || null)
    setAnalysis(null)
    setPendingFile(null)
    setTab('analyze')
    setNotice(`Loaded "${resume.name}".`)
  }

  async function handleDuplicate(resume) {
    setBusyId(resume.id)
    try {
      const copy = await duplicateResume(resume)
      setResumes((prev) => [copy, ...prev])
    } catch (err) {
      setError(err.message || 'Could not duplicate that version.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return

    setBusyId(pendingDelete.id)
    try {
      await deleteResume(pendingDelete.id)
      setResumes((prev) => prev.filter((r) => r.id !== pendingDelete.id))
      if (activeResume?.id === pendingDelete.id) setActiveResume(null)
      setPendingDelete(null)
    } catch (err) {
      setError(err.message || 'Could not delete that version.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDownload(resume) {
    setBusyId(resume.id)
    try {
      const url = await getResumeDownloadUrl(resume.file_url)
      window.open(url, '_blank', 'noopener')
    } catch (err) {
      setError(err.message || 'Could not open that file.')
    } finally {
      setBusyId(null)
    }
  }

  // Adds a missing keyword to the profile skills, so the analysis loops back
  // into the data the rest of the app uses.
  async function handleAddKeyword(keyword) {
    const current = profile?.skills || []
    if (current.some((s) => s.toLowerCase() === keyword.toLowerCase())) {
      setNotice(`"${keyword}" is already in your profile skills.`)
      return
    }

    try {
      await saveProfile({ skills: [...current, keyword] })
      setNotice(`Added "${keyword}" to your profile skills.`)
    } catch (err) {
      setError(err.message || 'Could not update your skills.')
    }
  }

  function applyRewrite(sectionKey, value) {
    // Rewrites land in the working text, which the user can still edit and
    // re-analyse before saving.
    const next = { ...sections.sections, [sectionKey]: value }
    setResumeText(sectionsToText(sections.personal, next))
    setNotice('Applied. Re-analyse to see how the score moves.')
    setTab('analyze')
  }

  /* ------------------------------------------------------------------- view */

  return (
    <div className="mx-auto max-w-5xl">

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Optimizer</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {activeResume ? `Editing "${activeResume.name}"` : 'Analyse your resume against a specific job'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            variant="secondary"
            onClick={handleSaveVersion}
            disabled={saving || !resumeText.trim()}
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving…' : activeResume ? 'Update version' : 'Save version'}
          </Button>
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} className="mb-6" />

      {error && (
        <div className="mb-5 flex items-start justify-between gap-3 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-700 dark:text-rose-300">
          <span className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </span>
          <button onClick={() => setError('')} aria-label="Dismiss" className="leading-none">×</button>
        </div>
      )}

      {notice && (
        <div className="mb-5 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-700 dark:text-emerald-300">
          <Check className="h-3.5 w-3.5 shrink-0" />
          {notice}
        </div>
      )}

      {tab === 'analyze' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ResumeSourcePanel
              text={resumeText}
              onTextChange={setResumeText}
              onFileParsed={handleFileParsed}
            />

            <JobTargetPanel
              jobs={jobs}
              selectedJobId={selectedJobId}
              onSelectJob={handleSelectJob}
              jobDescription={jobDescription}
              onJobDescriptionChange={setJobDescription}
              targetRole={targetRole}
              onTargetRoleChange={setTargetRole}
            />
          </div>

          <div className="flex flex-col items-center gap-2">
            <Button size="lg" onClick={handleAnalyze} disabled={!canAnalyze}>
              {analyzing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Analysing…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyse resume
                </>
              )}
            </Button>

            {!canAnalyze && !analyzing && (
              <p className="text-xs text-gray-400 dark:text-white/25">
                {resumeText.trim().length < 100
                  ? 'Add your resume to continue'
                  : 'Add a job description to continue'}
              </p>
            )}
          </div>

          {analysis && !showResults && (
            <button
              type="button"
              onClick={() => setShowResults(true)}
              className="flex w-full items-center justify-between gap-4 rounded-xl border border-violet-500/25 bg-violet-500/[0.06] px-5 py-4 text-left transition-colors hover:bg-violet-500/[0.1]"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Your last analysis is ready
                </p>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-white/35">
                  {analysis.overall_score}/100 overall ·{' '}
                  {analysis.missing_keywords?.length || 0} missing keywords
                </p>
              </div>
              <span className="shrink-0 text-sm font-medium text-violet-600 dark:text-violet-400">
                View report →
              </span>
            </button>
          )}
        </div>
      )}

      {tab === 'improve' && (
        <div className="space-y-5">
          {!resumeText.trim() ? (
            <p className="rounded-xl border border-dashed border-gray-200 px-4 py-12 text-center text-sm text-gray-400 dark:border-white/[0.08] dark:text-white/25">
              Add your resume on the Analyse tab first.
            </p>
          ) : (
            <>
              {sections.detected.length === 0 && (
                <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-300">
                  No section headings were detected in your resume, so everything
                  is treated as one block. Adding headings like "Experience" and
                  "Skills" helps both this tool and real ATS software.
                </p>
              )}

              {REWRITABLE_SECTIONS.map(({ key, label }) => (
                <SectionRewriter
                  key={key}
                  section={key}
                  label={label}
                  content={key === 'cover_letter' ? '' : sections.sections[key] || ''}
                  jobDescription={jobDescription}
                  targetRole={targetRole}
                  profile={profile}
                  onAccept={(value) => {
                    if (key === 'cover_letter') {
                      navigator.clipboard.writeText(value)
                      setNotice('Cover letter copied to your clipboard.')
                      return
                    }
                    applyRewrite(key, value)
                  }}
                />
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'versions' && (
        <ResumeVersionList
          resumes={resumes}
          activeId={activeResume?.id}
          onOpen={handleOpenResume}
          onDuplicate={handleDuplicate}
          onDelete={setPendingDelete}
          onDownload={handleDownload}
          busyId={busyId}
        />
      )}

      {analysis && showResults && (
        <Modal
          title="Resume analysis"
          subtitle={targetRole ? `Against ${targetRole}` : 'Against the job description provided'}
          size="xl"
          onClose={() => setShowResults(false)}
        >
          <AnalysisReport analysis={analysis} onAddKeyword={handleAddKeyword} />
        </Modal>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this version?"
          message={`"${pendingDelete.name}" and its analysis history will be removed. This can't be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setPendingDelete(null)}
          busy={busyId === pendingDelete.id}
        />
      )}
    </div>
  )
}
