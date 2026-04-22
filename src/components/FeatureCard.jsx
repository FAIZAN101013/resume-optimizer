import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

// 🧠 Variant map — add any color here in future, no other changes needed
const variants = {
  violet: {
    icon: "bg-violet-500/10 text-violet-400",
    tag: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    cta: "text-violet-400",
    hover: "hover:border-violet-500/30 hover:bg-violet-500/[0.04] hover:shadow-violet-500/10",
    label: "Try it free",
  },
  emerald: {
    icon: "bg-emerald-500/10 text-emerald-400",
    tag: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    cta: "text-emerald-400",
    hover: "hover:border-emerald-500/30 hover:bg-emerald-500/[0.04] hover:shadow-emerald-500/10",
    label: "Start tracking",
  },
}

export default function FeatureCard({
  title,
  description,
  icon: Icon,
  tags = [],
  to,
  color = "violet",
}) {
  const v = variants[color]

  return (
    <Link
      to={to}
      className={`group flex flex-col p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${v.hover}`}
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${v.icon}`}>
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-white/90 transition-colors">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed mb-5">
        {description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${v.tag}`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* CTA — pushed to bottom */}
      <div className={`mt-auto flex items-center gap-1.5 text-sm font-semibold transition-all duration-200 group-hover:gap-3 ${v.cta}`}>
        {v.label}
        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}