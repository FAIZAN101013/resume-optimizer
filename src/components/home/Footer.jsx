import Logo from '../Logo/Logo'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-white/[0.06] px-8 py-5 flex items-center justify-between">
      <Logo compact showTagline={false} />
      <p className="text-xs text-gray-500 dark:text-gray-700">© 2025 JोBz. Built like a real product.</p>
    </footer>
  )
}
