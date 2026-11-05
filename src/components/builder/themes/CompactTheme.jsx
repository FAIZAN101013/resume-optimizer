// Sidebar left, content right. Fits more into one page than the single-column
// themes, at the cost of being harder for older ATS parsers to read — which is
// why the builder warns about it rather than defaulting to it.

function SideSection({ title, children }) {
  return (
    <section className="mt-4 first:mt-0">
      <h2 className="mb-1.5 text-[8.5pt] font-bold uppercase tracking-[0.12em] text-neutral-500">
        {title}
      </h2>
      {children}
    </section>
  )
}

function MainSection({ title, children }) {
  return (
    <section className="mt-4 first:mt-0">
      <h2 className="mb-2 border-b border-neutral-300 pb-1 text-[10pt] font-bold uppercase tracking-wide">
        {title}
      </h2>
      <div className="space-y-2.5">{children}</div>
    </section>
  )
}

function Bullets({ items }) {
  if (!items.length) return null

  return (
    <ul className="mt-1 space-y-0.5 pl-3.5">
      {items.map((text, i) => (
        <li key={i} className="list-disc text-[9pt] leading-snug">
          {text}
        </li>
      ))}
    </ul>
  )
}

export default function CompactTheme({ doc }) {
  return (
    <article className="font-sans text-black">
      <header className="mb-4">
        <h1 className="text-[22pt] font-bold leading-none">{doc.name || 'Your Name'}</h1>
        {doc.headline && (
          <p className="mt-0.5 text-[10.5pt] text-neutral-600">{doc.headline}</p>
        )}
      </header>

      <div className="flex gap-6">

        {/* Sidebar */}
        <aside className="w-[32%] shrink-0 border-r border-neutral-200 pr-5">
          <SideSection title="Contact">
            <div className="space-y-1 text-[8.5pt] leading-snug">
              {doc.email && <div className="break-all">{doc.email}</div>}
              {doc.phone && <div>{doc.phone}</div>}
              {doc.location && <div>{doc.location}</div>}
              {doc.links.map((link) => (
                <div key={link.key}>
                  <a href={link.href} className="underline-offset-2 hover:underline">
                    {link.label}
                  </a>
                </div>
              ))}
            </div>
          </SideSection>

          {doc.skills.length > 0 && (
            <SideSection title="Skills">
              <ul className="space-y-0.5 text-[8.5pt] leading-snug">
                {doc.skills.map((skill, i) => (
                  <li key={i}>{skill}</li>
                ))}
              </ul>
            </SideSection>
          )}

          {doc.education.length > 0 && (
            <SideSection title="Education">
              <div className="space-y-2">
                {doc.education.map((entry, i) => (
                  <div key={i} className="text-[8.5pt] leading-snug">
                    <div className="font-semibold">{entry.degree}</div>
                    <div className="text-neutral-600">{entry.school}</div>
                    <div className="text-neutral-500">
                      {[entry.range, entry.grade].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                ))}
              </div>
            </SideSection>
          )}

          {doc.certifications.length > 0 && (
            <SideSection title="Certifications">
              <div className="space-y-1.5">
                {doc.certifications.map((cert, i) => (
                  <div key={i} className="text-[8.5pt] leading-snug">
                    <div className="font-semibold">{cert.name}</div>
                    <div className="text-neutral-600">
                      {[cert.issuer, cert.date].filter(Boolean).join(' · ')}
                    </div>
                  </div>
                ))}
              </div>
            </SideSection>
          )}
        </aside>

        {/* Main column */}
        <div className="min-w-0 flex-1">
          {doc.summary && (
            <MainSection title="Summary">
              <p className="text-[9pt] leading-snug">{doc.summary}</p>
            </MainSection>
          )}

          {doc.experience.length > 0 && (
            <MainSection title="Experience">
              {doc.experience.map((job, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[10pt] font-bold">{job.title}</h3>
                    <span className="shrink-0 text-[8pt] text-neutral-600">{job.range}</span>
                  </div>
                  <p className="text-[9pt] italic text-neutral-700">
                    {[job.company, job.location].filter(Boolean).join(' · ')}
                  </p>
                  <Bullets items={job.bullets} />
                </div>
              ))}
            </MainSection>
          )}

          {doc.projects.length > 0 && (
            <MainSection title="Projects">
              {doc.projects.map((project, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-[10pt] font-bold">{project.name}</h3>
                    {project.url && (
                      <a
                        href={project.url}
                        className="shrink-0 text-[8pt] text-neutral-600 underline-offset-2 hover:underline"
                      >
                        {project.urlLabel}
                      </a>
                    )}
                  </div>
                  {project.tech && (
                    <p className="text-[8.5pt] italic text-neutral-600">{project.tech}</p>
                  )}
                  <Bullets items={project.bullets} />
                </div>
              ))}
            </MainSection>
          )}
        </div>
      </div>
    </article>
  )
}
