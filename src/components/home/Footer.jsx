import Logo from '../Logo/Logo'
import { SUPPORT_EMAIL } from '../../lib/constants'

export default function Footer() {
  return (
    <footer className="flex flex-col items-center gap-3 border-t border-gray-200 px-8 py-5 sm:flex-row sm:justify-between dark:border-white/[0.06]">
      <Logo compact showTagline={false} />

      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-700">
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
        >
          Contact
        </a>
        <span>© 2026 JोBz · Track • Apply • Grow</span>
      </div>
    </footer>
  )
}
