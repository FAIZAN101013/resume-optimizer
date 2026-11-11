import { useState } from 'react'
import {
  ChevronDown,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  User,
  GraduationCap,
  Briefcase,
  Wrench,
  FolderGit2,
  Award,
} from 'lucide-react'

import { fieldClasses, Label } from '../common/Field'
import TagInput from '../common/TagInput'
import {
  moveItem,
  newExperience,
  newProject,
  newEducation,
  newCertification,
} from '../../lib/resumeDocument'

const LINK_LABELS = ['GitHub', 'LinkedIn', 'Portfolio', 'Website', 'Other']

function Accordion({ title, icon: Icon, count, open, onToggle, children }) {
  return (
    <div className="border-b border-gray-200 last:border-0 dark:border-white/[0.06]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2.5 py-3 text-left"
      >
        <Icon className="h-4 w-4 shrink-0 text-gray-400 dark:text-white/30" strokeWidth={1.75} />

        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </span>

        {count != null && count > 0 && (
          <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-white/[0.06] dark:text-white/35">
            {count}
          </span>
        )}

        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform dark:text-white/30 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

/** One repeatable entry, with reorder and remove controls. */
function Entry({ title, index, total, onMove, onRemove, children }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-white/[0.06] dark:bg-white/[0.02]">
      <div className="flex items-center gap-1 px-2.5 py-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
        >
          <ChevronDown
            className={`h-3 w-3 shrink-0 text-gray-400 transition-transform dark:text-white/30 ${
              open ? 'rotate-180' : ''
            }`}
          />
          <span className="truncate text-xs font-medium text-gray-900 dark:text-white">
            {title || `Entry ${index + 1}`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onMove(index - 1)}
          disabled={index === 0}
          aria-label="Move up"
          className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-25 dark:text-white/25 dark:hover:text-white"
        >
          <ArrowUp className="h-3 w-3" />
        </button>

        <button
          type="button"
          onClick={() => onMove(index + 1)}
          disabled={index === total - 1}
          aria-label="Move down"
          className="rounded p-1 text-gray-400 hover:text-gray-700 disabled:opacity-25 dark:text-white/25 dark:hover:text-white"
        >
          <ArrowDown className="h-3 w-3" />
        </button>

        <button
          type="button"
          onClick={() => onRemove(index)}
          aria-label="Remove"
          className="rounded p-1 text-gray-400 hover:bg-rose-500/10 hover:text-rose-600 dark:text-white/25 dark:hover:text-rose-400"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {open && (
        <div className="space-y-2.5 border-t border-gray-200 p-2.5 dark:border-white/[0.06]">
          {children}
        </div>
      )}
    </div>
  )
}

function AddButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 py-2 text-[11px] font-medium text-gray-500 transition-colors hover:border-violet-400 hover:text-violet-600 dark:border-white/[0.1] dark:text-white/40 dark:hover:border-violet-400/50 dark:hover:text-violet-400"
    >
      <Plus className="h-3 w-3" />
      {label}
    </button>
  )
}

/** Bullets are edited as one-per-line text, which is how people type them. */
function BulletsField({ value, onChange }) {
  return (
    <div>
      <Label>Bullets — one per line</Label>
      <textarea
        rows={4}
        value={(value || []).join('\n')}
        onChange={(e) => onChange(e.target.value.split('\n'))}
        placeholder={'Built X using Y, cutting load time by Z\nLed the migration to …'}
        className={`${fieldClasses} resize-none leading-relaxed`}
      />
    </div>
  )
}

// Defined at module scope on purpose. A component created inside the render
// body gets a fresh identity every render, so React would unmount and remount
// each input — and the field would lose focus on every keystroke.
function Field({ label, value, onValue, ...props }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        value={value || ''}
        onChange={(e) => onValue(e.target.value)}
        className={fieldClasses}
        {...props}
      />
    </div>
  )
}

export default function BuilderForm({ doc, onChange }) {
  const [open, setOpen] = useState('personal')

  const toggle = (key) => setOpen((cur) => (cur === key ? null : key))
  const set = (key, value) => onChange({ ...doc, [key]: value })

  const setItem = (key, index, patch) =>
    set(key, doc[key].map((item, i) => (i === index ? { ...item, ...patch } : item)))

  const addItem = (key, factory) => set(key, [...doc[key], factory()])
  const removeItem = (key, index) => set(key, doc[key].filter((_, i) => i !== index))
  const moveEntry = (key, from, to) => set(key, moveItem(doc[key], from, to))

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 dark:border-white/[0.06] dark:bg-white/[0.02]">

      {/* Personal */}
      <Accordion title="Personal info" icon={User} open={open === 'personal'} onToggle={() => toggle('personal')}>
        <div className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Full name" value={doc.name} onValue={(v) => set('name', v)} />
            <Field label="Job title" value={doc.headline} onValue={(v) => set('headline', v)} />
            <Field label="Email" type="email" value={doc.email} onValue={(v) => set('email', v)} />
            <Field label="Phone" value={doc.phone} onValue={(v) => set('phone', v)} />
          </div>

          <Field label="Location" value={doc.location} onValue={(v) => set('location', v)} />

          <div>
            <Label hint={`${doc.links.length} of 5`}>Links</Label>
            <div className="space-y-2">
              {doc.links.map((link, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={link.href}
                    onChange={(e) =>
                      set('links', doc.links.map((l, j) => (j === i ? { ...l, href: e.target.value } : l)))
                    }
                    placeholder="https://…"
                    className={`${fieldClasses} flex-1`}
                  />
                  <select
                    value={link.label}
                    onChange={(e) =>
                      set('links', doc.links.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)))
                    }
                    className={`${fieldClasses} w-28 shrink-0`}
                  >
                    {LINK_LABELS.map((l) => <option key={l}>{l}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => set('links', doc.links.filter((_, j) => j !== i))}
                    aria-label="Remove link"
                    className="shrink-0 rounded p-1.5 text-gray-400 hover:text-rose-600 dark:text-white/25 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {doc.links.length < 5 && (
                <AddButton
                  label="Add link"
                  onClick={() =>
                    set('links', [...doc.links, { key: `l${Date.now()}`, label: 'GitHub', href: '' }])
                  }
                />
              )}
            </div>
          </div>

          <div>
            <Label hint="Optional">Summary</Label>
            <textarea
              rows={4}
              value={doc.summary || ''}
              onChange={(e) => set('summary', e.target.value)}
              className={`${fieldClasses} resize-none leading-relaxed`}
            />
          </div>
        </div>
      </Accordion>

      {/* Experience */}
      <Accordion
        title="Experience"
        icon={Briefcase}
        count={doc.experience.length}
        open={open === 'experience'}
        onToggle={() => toggle('experience')}
      >
        <div className="space-y-2">
          {doc.experience.map((job, i) => (
            <Entry
              key={i}
              index={i}
              total={doc.experience.length}
              title={job.title || job.company}
              onMove={(to) => moveEntry('experience', i, to)}
              onRemove={(idx) => removeItem('experience', idx)}
            >
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Job title" value={job.title} onValue={(v) => setItem('experience', i, { title: v })} />
                <Field label="Company" value={job.company} onValue={(v) => setItem('experience', i, { company: v })} />
                <Field label="Location" value={job.location} onValue={(v) => setItem('experience', i, { location: v })} />
                <Field label="Dates" placeholder="03/2025 – 05/2025" value={job.range} onValue={(v) => setItem('experience', i, { range: v })} />
              </div>
              <BulletsField value={job.bullets} onChange={(v) => setItem('experience', i, { bullets: v })} />
            </Entry>
          ))}
          <AddButton label="Add experience" onClick={() => addItem('experience', newExperience)} />
        </div>
      </Accordion>

      {/* Projects */}
      <Accordion
        title="Projects"
        icon={FolderGit2}
        count={doc.projects.length}
        open={open === 'projects'}
        onToggle={() => toggle('projects')}
      >
        <div className="space-y-2">
          {doc.projects.map((project, i) => (
            <Entry
              key={i}
              index={i}
              total={doc.projects.length}
              title={project.name}
              onMove={(to) => moveEntry('projects', i, to)}
              onRemove={(idx) => removeItem('projects', idx)}
            >
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Name" value={project.name} onValue={(v) => setItem('projects', i, { name: v })} />
                <Field label="Role" value={project.role} onValue={(v) => setItem('projects', i, { role: v })} />
              </div>
              <Field label="Tech used" value={project.tech} onValue={(v) => setItem('projects', i, { tech: v })} />
              <Field
                label="Link"
                value={project.url}
                onValue={(v) =>
                  setItem('projects', i, {
                    url: v,
                    urlLabel: v.replace(/^https?:\/\//, '').replace(/\/$/, ''),
                  })
                }
              />
              <BulletsField value={project.bullets} onChange={(v) => setItem('projects', i, { bullets: v })} />
            </Entry>
          ))}
          <AddButton label="Add project" onClick={() => addItem('projects', newProject)} />
        </div>
      </Accordion>

      {/* Skills */}
      <Accordion
        title="Skills"
        icon={Wrench}
        count={doc.skills.length}
        open={open === 'skills'}
        onToggle={() => toggle('skills')}
      >
        <TagInput value={doc.skills} onChange={(v) => set('skills', v)} />
      </Accordion>

      {/* Education */}
      <Accordion
        title="Education"
        icon={GraduationCap}
        count={doc.education.length}
        open={open === 'education'}
        onToggle={() => toggle('education')}
      >
        <div className="space-y-2">
          {doc.education.map((entry, i) => (
            <Entry
              key={i}
              index={i}
              total={doc.education.length}
              title={entry.school || entry.degree}
              onMove={(to) => moveEntry('education', i, to)}
              onRemove={(idx) => removeItem('education', idx)}
            >
              <Field label="Degree" value={entry.degree} onValue={(v) => setItem('education', i, { degree: v })} />
              <Field label="Institution" value={entry.school} onValue={(v) => setItem('education', i, { school: v })} />
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Dates" placeholder="2020 – 2024" value={entry.range} onValue={(v) => setItem('education', i, { range: v })} />
                <Field label="Score" placeholder="6.6 CGPA" value={entry.grade} onValue={(v) => setItem('education', i, { grade: v })} />
              </div>
            </Entry>
          ))}
          <AddButton label="Add education" onClick={() => addItem('education', newEducation)} />
        </div>
      </Accordion>

      {/* Certifications */}
      <Accordion
        title="Certifications"
        icon={Award}
        count={doc.certifications.length}
        open={open === 'certifications'}
        onToggle={() => toggle('certifications')}
      >
        <div className="space-y-2">
          {doc.certifications.map((cert, i) => (
            <Entry
              key={i}
              index={i}
              total={doc.certifications.length}
              title={cert.name}
              onMove={(to) => moveEntry('certifications', i, to)}
              onRemove={(idx) => removeItem('certifications', idx)}
            >
              <Field label="Name" value={cert.name} onValue={(v) => setItem('certifications', i, { name: v })} />
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="Issuer" value={cert.issuer} onValue={(v) => setItem('certifications', i, { issuer: v })} />
                <Field label="Date" placeholder="06/2025" value={cert.date} onValue={(v) => setItem('certifications', i, { date: v })} />
              </div>
            </Entry>
          ))}
          <AddButton label="Add certification" onClick={() => addItem('certifications', newCertification)} />
        </div>
      </Accordion>
    </div>
  )
}
