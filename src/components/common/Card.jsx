const Card = ({ title, subtitle, children, className = "" }) => {
  return (
    <section
      className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-6 ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-xl font-semibold text-white">
              {title}
            </h2>
          )}

          {subtitle && (
            <p className="text-sm text-zinc-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {children}
    </section>
  );
};

export default Card;