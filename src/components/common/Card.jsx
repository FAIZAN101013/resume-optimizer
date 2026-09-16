// Matches the surface used across the dashboard and tracker: subtle border,
// near-transparent fill in dark, tight padding.
const Card = ({ title, subtitle, action, children, className = "" }) => {
  return (
    <section
      className={`rounded-xl border border-gray-200 bg-white p-5 transition-colors dark:border-white/[0.06] dark:bg-white/[0.02] ${className}`}
    >
      {(title || subtitle || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && (
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-white/35">
                {subtitle}
              </p>
            )}
          </div>

          {action}
        </div>
      )}

      {children}
    </section>
  );
};

export default Card;
