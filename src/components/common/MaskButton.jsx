import { Link } from 'react-router-dom'
import './MaskButton.css'

const SIZES = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

/**
 * Button with the sprite-mask dissolve on hover.
 *
 * The label is rendered twice on purpose: once underneath in the page's text
 * colour, once inside the masked fill in white. As the mask sweeps, the
 * underlay is what shows through — a single copy would vanish with the fill.
 */
export default function MaskButton({
  children,
  to,
  onClick,
  type = 'button',
  size = 'lg',
  className = '',
}) {
  const sizing = SIZES[size] || SIZES.lg
  const label = <span className="font-semibold tracking-wide">{children}</span>

  const inner = (
    <>
      {/* aria-hidden: the accessible name comes from the real control, and
          two copies would otherwise be announced twice. */}
      <span
        aria-hidden="true"
        className={`mask-btn__under ${sizing} text-gray-900 dark:text-white`}
      >
        {label}
      </span>

      <span className={`mask-btn__fill ${sizing}`}>{label}</span>
    </>
  )

  const shell = `mask-btn border border-gray-200 dark:border-white/[0.12] ${className}`

  if (to) {
    return (
      <Link to={to} className={shell}>
        {inner}
      </Link>
    )
  }

  return (
    <button type={type} onClick={onClick} className={shell}>
      {inner}
    </button>
  )
}
