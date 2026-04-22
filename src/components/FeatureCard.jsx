import { Link } from "react-router-dom"

export default function FeatureCard({
  title,
  description,
  icon: Icon,
  tags = [],
  to,
  color = "violet"
}) {
  return (
    <Link
      to={to}
      className="group p-6 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${
        color === "violet"
          ? "bg-violet-500/15"
          : "bg-emerald-500/15"
      }`}>
        <Icon
          className={`w-5 h-5 ${
            color === "violet"
              ? "text-violet-400"
              : "text-emerald-400"
          }`}
          strokeWidth={1.75}
        />
      </div>

      {/* Title */}
      <h3 className="text-white font-semibold text-lg mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-400 text-sm leading-relaxed mb-5">
        {description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`text-[11px] px-2.5 py-1 rounded-full border ${
              color === "violet"
                ? "text-violet-400 bg-violet-500/10 border-violet-500/20"
                : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div
        className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-200 group-hover:gap-2.5 ${
          color === "violet"
            ? "text-violet-400"
            : "text-emerald-400"
        }`}
      >
        {color === "violet" ? "Try it free" : "Start tracking"} →
      </div>
    </Link>
  )
}