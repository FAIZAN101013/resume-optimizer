import { AlertTriangle } from 'lucide-react'
import Button from '../Button'

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  busy = false,
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[380px] rounded-2xl border border-gray-200 bg-white p-6 text-gray-900 shadow-2xl dark:border-white/[0.09] dark:bg-[#13131c] dark:text-white">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
        </div>

        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-gray-500 dark:text-white/40">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
