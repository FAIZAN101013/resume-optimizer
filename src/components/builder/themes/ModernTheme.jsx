// Sans-serif, left-aligned, one accent colour on section headings and a rule
// under the name. Reads as contemporary without becoming a design piece.

const ACCENT = '#7C3AED'

function Section({ title, children }) {
  return (
    <section className="mt-5 first:mt-0">
      <h2
        className="text-[10pt] font-semibold uppercase tracking-[0.14em]"
        style={{ color: ACCENT }}
      >
        {title}
      </h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  )
}

function Bullets({ items }) {
  if (!items.length) return null

  return (
    <ul className="mt-1.5 space-y-1">
      {items.map((text, i) => (
        <li key={i} className="flex gap-2 text-[9.5pt] leading-snug">
          <span style={{ color: ACCENT }}>▪</span>
          <span>{text}</span>
        </li>
      ))}
    </ul>
  )
}

export default function ModernTheme({ doc }) {
  return (
    <article className="font-sans text-black">

      <header className="border-b-2 pb-3" style={{ borderColor: ACCENT }}>
        <h1 className="text-[24pt] font-bold leading-none tracking-tight">
          {doc.name || 'Your Name'}
        </h1>

        {doc.headline && (
          <p className="mt-1 text-[11pt]" style={{ color: ACCENT }}>
            {doc.headline}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[8.5pt] text-neutral-700">
          {[doc.email, doc.phone, doc.location].filter(Boolean).map((item, i) => (
            <span key={i}>{item}</span>
          ))}
          {doc.links.map((link) => (
            <a key={link.key} href={link.href} className="underline-offset-2 hover:underline">
              {link.label}
            </a>
          ))}
        </div>
      </header>

      {doc.summary && (
        <Section title="Profile">
          <p className="text-[9.5pt] leading-relaxed">{doc.summary}</p>
        </Section>
      )}

      {doc.experience.length > 0 && (
        <Section title="Experience">
          {doc.experience.map((job, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[10.5pt] font-semibold">{job.title}</h3>
                <span className="shrink-0 text-[8.5pt] text-neutral-600">{job.range}</span>
              </div>
              <p className="text-[9.5pt] text-neutral-700">
                {[job.company, job.location, job.type].filter(Boolean).join(' · ')}
              </p>
              <Bullets items={job.bullets} />
            </div>
          ))}
        </Section>
      )}

      {doc.projects.length > 0 && (
        <Section title="Projects">
          {doc.projects.map((project, i) => (
            <div key={i}>
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[10.5pt] font-semibold">{project.name}</h3>
                {project.url && (
                  <a
                    href={project.url}
                    className="shrink-0 text-[8.5pt] underline-offset-2 hover:underline"
                    style={{ color: ACCENT }}
                  >
                    {project.urlLabel}
                  </a>
                )}
              </div>
              {project.tech && (
                <p className="text-[9pt] text-neutral-600">{project.tech}</p>
              )}
              <Bullets items={project.bullets} />
            </div>
          ))}
        </Section>
      )}

      {doc.skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-1.5">
            {doc.skills.map((skill, i) => (
              <span
                key={i}
                className="rounded border px-1.5 py-0.5 text-[8.5pt]"
                style={{ borderColor: `${ACCENT}44` }}
              >
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {doc.education.length > 0 && (
        <Section title="Education">
          {doc.education.map((entry, i) => (
            <div key={i} className="flex items-baseline justify-between gap-4">
              <div>
                <h3 className="text-[10pt] font-semibold">{entry.degree}</h3>
                <p className="text-[9.5pt] text-neutral-700">
                  {[entry.school, entry.grade].filter(Boolean).join(' · ')}
                </p>
              </div>
              <span className="shrink-0 text-[8.5pt] text-neutral-600">{entry.range}</span>
            </div>
          ))}
        </Section>
      )}

      {doc.certifications.length > 0 && (
        <Section title="Certifications">
          {doc.certifications.map((cert, i) => (
            <div key={i} className="flex items-baseline justify-between gap-4 text-[9.5pt]">
              <span>
                <span className="font-medium">{cert.name}</span>
                {cert.issuer && <span className="text-neutral-700"> — {cert.issuer}</span>}
              </span>
              <span className="shrink-0 text-[8.5pt] text-neutral-600">{cert.date}</span>
            </div>
          ))}
        </Section>
      )}
    </article>
  )
}
