import { Link } from 'react-router-dom'
import './MaskButton.css'

// Matches Button's primary variant exactly — same radius, weight, padding and
// gradient — so the mask sweep reads as the same button with an effect on it,
// not as a different component.
const SIZES = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

/**
 * Button with the sprite-mask dissolve on hover.
 *
 * The label renders twice on purpose: once underneath, once inside the masked
 * fill. As the mask sweeps, the underlay is what shows through — with a single
 * copy the text would dissolve along with the fill and the button would go
 * blank mid-hover.
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

  const label = (
    <span className="inline-flex items-center gap-2 font-semibold">{children}</span>
  )

  const inner = (
    <>
      {/* aria-hidden so the accessible name comes from the control alone and
          the label is not announced twice. */}
      <span
        aria-hidden="true"
        className={`mask-btn__under ${sizing} text-violet-700 dark:text-violet-300`}
      >
        {label}
      </span>

      <span className={`mask-btn__fill ${sizing}`}>{label}</span>
    </>
  )

  const shell =
    'mask-btn transition-transform duration-300 hover:scale-[1.03] active:scale-[0.97] ' +
    `shadow-lg shadow-violet-500/20 ${className}`

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
