// No rules, no colour, generous leading. Typographic hierarchy does all the
// work. The safest possible thing to hand to a parser, and it reads calm.

function Section({ title, children }) {
  return (
    <section className="mt-6 first:mt-0">
      <h2 className="mb-2.5 text-[8.5pt] font-medium uppercase tracking-[0.2em] text-neutral-400">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

function Bullets({ items }) {
  if (!items.length) return null

  return (
    <ul className="mt-1.5 space-y-1">
      {items.map((text, i) => (
        <li key={i} className="text-[9.5pt] leading-relaxed text-neutral-800">
          {text}
        </li>
      ))}
    </ul>
  )
}

export default function MinimalTheme({ doc }) {
  return (
    <article className="font-sans text-black">

      <header className="mb-8">
        <h1 className="text-[20pt] font-normal tracking-tight">{doc.name || 'Your Name'}</h1>

        {doc.headline && (
          <p className="mt-1 text-[10.5pt] text-neutral-600">{doc.headline}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[8.5pt] text-neutral-500">
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
        <Section title="About">
          <p className="text-[9.5pt] leading-relaxed text-neutral-800">{doc.summary}</p>
        </Section>
      )}

      {doc.experience.length > 0 && (
        <Section title="Experience">
          {doc.experience.map((job, i) => (
            <div key={i}>
              <h3 className="text-[10.5pt] font-medium">{job.title}</h3>
              <p className="text-[9pt] text-neutral-500">
                {[job.company, job.range, job.location].filter(Boolean).join('  ·  ')}
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
              <h3 className="text-[10.5pt] font-medium">
                {project.name}
                {project.url && (
                  <a
                    href={project.url}
                    className="ml-2 text-[8.5pt] font-normal text-neutral-500 underline-offset-2 hover:underline"
                  >
                    {project.urlLabel}
                  </a>
                )}
              </h3>
              {project.tech && (
                <p className="text-[9pt] text-neutral-500">{project.tech}</p>
              )}
              <Bullets items={project.bullets} />
            </div>
          ))}
        </Section>
      )}

      {doc.skills.length > 0 && (
        <Section title="Skills">
          <p className="text-[9.5pt] leading-relaxed text-neutral-800">
            {doc.skills.join('   ·   ')}
          </p>
        </Section>
      )}

      {doc.education.length > 0 && (
        <Section title="Education">
          {doc.education.map((entry, i) => (
            <div key={i}>
              <h3 className="text-[10pt] font-medium">{entry.degree}</h3>
              <p className="text-[9pt] text-neutral-500">
                {[entry.school, entry.range, entry.grade].filter(Boolean).join('  ·  ')}
              </p>
            </div>
          ))}
        </Section>
      )}

      {doc.certifications.length > 0 && (
        <Section title="Certifications">
          {doc.certifications.map((cert, i) => (
            <p key={i} className="text-[9.5pt] text-neutral-800">
              <span className="font-medium">{cert.name}</span>
              <span className="text-neutral-500">
                {[cert.issuer, cert.date].filter(Boolean).length
                  ? `  ·  ${[cert.issuer, cert.date].filter(Boolean).join('  ·  ')}`
                  : ''}
              </span>
            </p>
          ))}
        </Section>
      )}
    </article>
  )
}
