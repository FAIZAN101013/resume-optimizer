import { useRef, useState } from 'react'
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react'

import Card from '../common/Card'
import { fieldClasses } from '../common/Field'
import { parseResumeFile } from '../../services/aiService'
import { validateResumeFile } from '../../services/resumeService'

export default function ResumeSourcePanel({ text, onTextChange, onFileParsed }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)

  async function handleFile(file) {
    if (!file) return

    setError('')

    try {
      validateResumeFile(file)
    } catch (err) {
      setError(err.message)
      return
    }

    setBusy(true)
    try {
      const { text: extracted } = await parseResumeFile(file)
      // The original file is uploaded separately and kept untouched; this is
      // only the extracted working copy.
      onFileParsed(extracted, file)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card
      title="Your resume"
      subtitle="Upload a PDF or DOCX, or paste the text"
      action={
        <span className="shrink-0 text-[11px] tabular-nums text-gray-400 dark:text-white/25">
          {text.length.toLocaleString()} chars
        </span>
      }
    >
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
        onClick={() => !busy && inputRef.current?.click()}
        className={`mb-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-4 py-6 text-center transition-colors ${
          dragging
            ? 'border-violet-400 bg-violet-500/[0.06]'
            : 'border-gray-300 hover:border-violet-400 dark:border-white/[0.1] dark:hover:border-violet-400/50'
        }`}
      >
        {busy ? (
          <>
            <Loader2 className="mb-2 h-5 w-5 animate-spin text-violet-500" />
            <p className="text-xs text-gray-500 dark:text-white/40">Reading your resume…</p>
          </>
        ) : (
          <>
            <Upload className="mb-2 h-5 w-5 text-gray-400 dark:text-white/30" strokeWidth={1.75} />
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Drop a file or click to browse
            </p>
            <p className="mt-0.5 text-[11px] text-gray-400 dark:text-white/25">
              PDF or DOCX, up to 3 MB
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            handleFile(file)
          }}
        />
      </div>

      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-gray-500 dark:text-white/35">
        <FileText className="h-3 w-3" />
        Resume text
      </div>

      <textarea
        rows={12}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Paste your resume here, or upload a file above…"
        className={`${fieldClasses} resize-none leading-relaxed scrollbar-none`}
      />
    </Card>
  )
}
