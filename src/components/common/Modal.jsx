import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

const WIDTHS = {
  md: 'max-w-[520px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[900px]',
}

/**
 * Overlay panel with its own scroll.
 *
 * Long results shown inline push the controls that produced them off screen,
 * so the user scrolls past their own inputs to read an answer. A modal keeps
 * the reading in one place and leaves the page where it was.
 */
export default function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  size = 'lg',
}) {
  const panelRef = useRef(null)

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    // The page behind must not scroll while this is open, or closing the
    // modal drops the user somewhere they never navigated to.
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    panelRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-8"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`my-auto flex max-h-[calc(100vh-4rem)] w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl outline-none dark:border-white/[0.09] dark:bg-[#13131c] ${WIDTHS[size] || WIDTHS.lg}`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-white/[0.06]">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-white/35">{subtitle}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-900 dark:border-white/10 dark:text-white/50 dark:hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5 scrollbar-none">{children}</div>

        {footer && (
          <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 px-5 py-3.5 dark:border-white/[0.06]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
