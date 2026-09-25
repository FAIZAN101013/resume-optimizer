import { FileText, Copy, Trash2, Download, Check } from 'lucide-react'

import Card from '../common/Card'
import { scoreTone } from '../../lib/scores'

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function ResumeVersionList({
  resumes,
  activeId,
  onOpen,
  onDuplicate,
  onDelete,
  onDownload,
  busyId,
}) {
  if (resumes.length === 0) {
    return (
      <Card title="Saved versions" subtitle="Tailored resumes for different roles">
        <p className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-xs leading-relaxed text-gray-400 dark:border-white/[0.08] dark:text-white/25">
          No saved versions yet. Analyse a resume and save it to build up
          variants for different kinds of role.
        </p>
      </Card>
    )
  }

  return (
    <Card
      title="Saved versions"
      subtitle={`${resumes.length} resume${resumes.length === 1 ? '' : 's'}`}
    >
      <ul className="space-y-2">
        {resumes.map((resume) => {
          const isActive = resume.id === activeId
          const tone = resume.ai_score != null ? scoreTone(resume.ai_score) : null

          return (
            <li
              key={resume.id}
              className={`rounded-lg border p-3 transition-colors ${
                isActive
                  ? 'border-violet-500/30 bg-violet-500/[0.06]'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300 dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-white/[0.1]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onOpen(resume)}
                  className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
                >
                  <FileText
                    className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 dark:text-white/30"
                    strokeWidth={1.75}
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {resume.name}
                      </span>
                      {isActive && (
                        <Check className="h-3 w-3 shrink-0 text-violet-500" />
                      )}
                    </div>

                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-gray-500 dark:text-white/30">
                      {resume.target_role && <span className="truncate">{resume.target_role}</span>}
                      <span>· {formatDate(resume.updated_at)}</span>
                      {resume.file_name && <span>· {resume.file_name}</span>}
                    </div>
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-1">
                  {tone && (
                    <span className={`mr-1 text-sm font-semibold tabular-nums ${tone.text}`}>
                      {resume.ai_score}
                    </span>
                  )}

                  {resume.file_url && (
                    <button
                      type="button"
                      onClick={() => onDownload(resume)}
                      disabled={busyId === resume.id}
                      title="Download the original file"
                      className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50 dark:text-white/25 dark:hover:bg-white/[0.06] dark:hover:text-white"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onDuplicate(resume)}
                    disabled={busyId === resume.id}
                    title="Duplicate"
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 disabled:opacity-50 dark:text-white/25 dark:hover:bg-white/[0.06] dark:hover:text-white"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(resume)}
                    disabled={busyId === resume.id}
                    title="Delete"
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-rose-500/10 hover:text-rose-600 disabled:opacity-50 dark:text-white/25 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
