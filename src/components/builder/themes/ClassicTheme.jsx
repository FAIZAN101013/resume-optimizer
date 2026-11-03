import { splitColumns } from '../../../lib/resumeDocument'

// Serif, centred header, ruled section headings, title-left/date-right rows.
// The layout most engineering resumes use, and the one this project's author
// uses. Deliberately conservative: it parses cleanly in ATS software.

function Section({ title, children }) {
  return (
    <section className="mt-4 first:mt-0">
      <h2 className="border-b-2 border-black pb-0.5 text-[11.5pt] font-bold uppercase tracking-wide">
        {title}
      </h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  )
}

/** Title on the left, dates on the right — the row this template is built on. */
function SplitRow({ left, right, leftClass = '', rightClass = '' }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <div className={`min-w-0 ${leftClass}`}>{left}</div>
      <div className={`shrink-0 whitespace-pre-line text-right text-[9pt] ${rightClass}`}>
        {right}
      </div>
    </div>
  )
}

function Bullets({ items }) {
  if (!items.length) return null

  return (
    <ul className="mt-1 space-y-0.5 pl-4">
      {items.map((text, i) => (
        <li key={i} className="list-disc text-[9.5pt] leading-snug">
          {text}
        </li>
      ))}
    </ul>
  )
}

export default function ClassicTheme({ doc }) {
  const skillColumns = splitColumns(doc.skills, 2)

  return (
    <article className="font-serif text-black">

      {/* Header */}
      <header className="text-center">
        <h1 className="text-[26pt] font-bold leading-none">{doc.name || 'Your Name'}</h1>

        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[9pt]">
          {doc.email && <span>{doc.email}</span>}
          {doc.phone && <span>{doc.phone}</span>}
          {doc.location && <span>{doc.location}</span>}
          {doc.links.map((link) => (
            <a key={link.key} href={link.href} className="underline-offset-2 hover:underline">
              {link.label}
            </a>
          ))}
        </div>
      </header>

      <div className="mt-5">
        {doc.summary && (
          <Section title="Summary">
            <p className="text-[9.5pt] leading-snug">{doc.summary}</p>
          </Section>
        )}

        {doc.experience.length > 0 && (
          <Section title="Professional Experience">
            {doc.experience.map((job, i) => (
              <div key={i}>
                <SplitRow
                  left={<div className="text-[10.5pt] font-bold">{job.title}</div>}
                  right={job.range}
                />
                <SplitRow
                  left={<div className="text-[9.5pt] italic">{job.company}</div>}
                  right={[job.location, job.type].filter(Boolean).join(' · ')}
                />
                <Bullets items={job.bullets} />
              </div>
            ))}
          </Section>
        )}

        {doc.projects.length > 0 && (
          <Section title="Projects">
            {doc.projects.map((project, i) => (
              <div key={i}>
                <SplitRow
                  left={
                    <div className="text-[10.5pt] font-bold">
                      {project.name}
                      {project.role && (
                        <span className="font-normal"> – {project.role}</span>
                      )}
                    </div>
                  }
                  right={
                    project.url ? (
                      <a href={project.url} className="underline-offset-2 hover:underline">
                        {project.urlLabel}
                      </a>
                    ) : null
                  }
                />
                {project.tech && (
                  <div className="text-[9pt] italic">{project.tech}</div>
                )}
                <Bullets items={project.bullets} />
              </div>
            ))}
          </Section>
        )}

        {doc.skills.length > 0 && (
          <Section title="Skills">
            <div className="grid grid-cols-2 gap-x-8 gap-y-1">
              {skillColumns.map((column, i) => (
                <p key={i} className="text-[9.5pt] leading-snug">
                  {column.join(', ')}
                </p>
              ))}
            </div>
          </Section>
        )}

        {doc.education.length > 0 && (
          <Section title="Education">
            {doc.education.map((entry, i) => (
              <div key={i}>
                <SplitRow
                  left={<div className="text-[10.5pt] font-bold">{entry.degree}</div>}
                  right={entry.range}
                />
                <SplitRow
                  left={<div className="text-[9.5pt] italic">{entry.school}</div>}
                  right={entry.grade}
                />
              </div>
            ))}
          </Section>
        )}

        {doc.certifications.length > 0 && (
          <Section title="Certifications">
            {doc.certifications.map((cert, i) => (
              <SplitRow
                key={i}
                left={
                  <div className="text-[9.5pt]">
                    <span className="font-bold">{cert.name}</span>
                    {cert.issuer && <span className="italic"> — {cert.issuer}</span>}
                  </div>
                }
                right={cert.date}
              />
            ))}
          </Section>
        )}
      </div>
    </article>
  )
}
