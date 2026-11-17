import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

const variants = {
  violet: {
    icon: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    tag: "text-violet-700 bg-violet-500/10 border-violet-500/20 dark:text-violet-400",
    cta: "text-violet-600 dark:text-violet-400",
    hover: "hover:border-violet-500/30 hover:bg-violet-500/[0.04] hover:shadow-violet-500/10",
  },
  cyan: {
    icon: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    tag: "text-cyan-700 bg-cyan-500/10 border-cyan-500/20 dark:text-cyan-400",
    cta: "text-cyan-600 dark:text-cyan-400",
    hover: "hover:border-cyan-500/30 hover:bg-cyan-500/[0.04] hover:shadow-cyan-500/10",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    tag: "text-emerald-700 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400",
    cta: "text-emerald-600 dark:text-emerald-400",
    hover: "hover:border-emerald-500/30 hover:bg-emerald-500/[0.04] hover:shadow-emerald-500/10",
  },
  amber: {
    icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    tag: "text-amber-700 bg-amber-500/10 border-amber-500/20 dark:text-amber-400",
    cta: "text-amber-600 dark:text-amber-400",
    hover: "hover:border-amber-500/30 hover:bg-amber-500/[0.04] hover:shadow-amber-500/10",
  },
}

export default function FeatureCard({
  title,
  description,
  icon: Icon,
  tags = [],
  to,
  color = "violet",
  // The label is passed in rather than baked into the colour, so a card's
  // call to action describes what it does instead of what colour it is.
  label = "Open",
}) {
  const v = variants[color] || variants.violet

  return (
    <Link
      to={to}
      // h-full matters: the grid stretches the wrapper, but without this the
      // link sizes to its own content and the row ends up ragged.
      className={`group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-white/[0.06] dark:bg-white/[0.02] ${v.hover}`}
    >
      <div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl ${v.icon}`}>
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>

      <p className="mb-5 text-sm leading-relaxed text-gray-500">{description}</p>

      {tags.length > 0 && (
        <div className="mb-6 flex flex-wrap content-start gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${v.tag}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div
        className={`mt-auto flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 group-hover:gap-3 ${v.cta}`}
      >
        {label}
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}
