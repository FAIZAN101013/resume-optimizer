import { ShieldCheck, ShieldAlert, ArrowRight } from 'lucide-react'
import { THEMES } from './themes'

// A4 at 96dpi. The card renders a real sheet and scales it down, so the
// thumbnail is the actual template with the user's actual content — not a
// mockup that could drift away from what they'll get.
const A4_WIDTH = 794
const A4_HEIGHT = 1123
const PREVIEW_WIDTH = 260

export default function TemplateGallery({ doc, selected, onSelect }) {
  const scale = PREVIEW_WIDTH / A4_WIDTH

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {THEMES.map((theme) => {
        const ThemeComponent = theme.component
        const isSelected = theme.key === selected

        return (
          <button
            key={theme.key}
            type="button"
            onClick={() => onSelect(theme.key)}
            className={`group flex flex-col overflow-hidden rounded-xl border text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl ${
              isSelected
                ? 'border-violet-500/50 ring-2 ring-violet-500/25'
                : 'border-gray-200 hover:border-gray-300 dark:border-white/[0.08] dark:hover:border-white/[0.16]'
            }`}
          >
            {/* Thumbnail */}
            <div
              className="relative overflow-hidden bg-gray-100 dark:bg-black/30"
              style={{ height: PREVIEW_WIDTH * (A4_HEIGHT / A4_WIDTH) * 0.52 }}
            >
              <div
                className="pointer-events-none origin-top-left"
                style={{ transform: `scale(${scale})`, width: A4_WIDTH }}
                aria-hidden="true"
              >
                <div className="resume-sheet">
                  <ThemeComponent doc={doc} />
                </div>
              </div>

              {/* Fades the cut-off rather than ending on a hard edge */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-gray-100 to-transparent dark:from-black/30" />

              {isSelected && (
                <span className="absolute right-2 top-2 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-medium text-white">
                  Selected
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-1 flex-col border-t border-gray-200 bg-white p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {theme.name}
                </span>

                {theme.atsSafe ? (
                  <span
                    title="Single column — parses cleanly in ATS software"
                    className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400"
                  >
                    <ShieldCheck className="h-3 w-3" /> ATS safe
                  </span>
                ) : (
                  <span
                    title="Two columns can be read across by older parsers"
                    className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400"
                  >
                    <ShieldAlert className="h-3 w-3" /> Check ATS
                  </span>
                )}
              </div>

              <p className="mb-3 text-[11px] leading-relaxed text-gray-500 dark:text-white/35">
                {theme.description}
              </p>

              <span className="mt-auto flex items-center gap-1.5 text-xs font-semibold text-violet-600 transition-all group-hover:gap-2.5 dark:text-violet-400">
                {isSelected ? 'Continue' : 'Use this template'}
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
