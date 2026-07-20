import { useState } from 'react'
import { X } from 'lucide-react'
import { fieldClasses, Label } from './Field'

// Skills are stored as a text[] column, so this edits an array of strings.
export default function TagInput({
  label,
  hint,
  value = [],
  onChange,
  placeholder = 'Type a skill and press Enter',
}) {
  const [draft, setDraft] = useState('')

  const addTag = (raw) => {
    const tag = raw.trim()
    if (!tag) return

    // Case-insensitive dedupe — "React" and "react" are the same skill.
    const exists = value.some((v) => v.toLowerCase() === tag.toLowerCase())
    if (!exists) onChange([...value, tag])

    setDraft('')
  }

  const removeTag = (index) => onChange(value.filter((_, i) => i !== index))

  const handleKeyDown = (e) => {
    // Comma is how most people separate skills when pasting.
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(draft)
      return
    }

    // Backspace on an empty box removes the last tag.
    if (e.key === 'Backspace' && !draft && value.length) {
      removeTag(value.length - 1)
    }
  }

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text')
    if (!text.includes(',')) return

    e.preventDefault()
    const tags = text.split(',').map((t) => t.trim()).filter(Boolean)

    const merged = [...value]
    for (const tag of tags) {
      if (!merged.some((v) => v.toLowerCase() === tag.toLowerCase())) merged.push(tag)
    }
    onChange(merged)
  }

  return (
    <div>
      {label && <Label hint={hint}>{label}</Label>}

      {value.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-2">
          {value.map((tag, i) => (
            <span
              key={`${tag}-${i}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-700 dark:text-violet-300"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                aria-label={`Remove ${tag}`}
                className="text-violet-500/60 transition-colors hover:text-violet-500 dark:hover:text-violet-200"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        // Don't silently drop what's typed if the user clicks Save directly.
        onBlur={() => addTag(draft)}
        placeholder={placeholder}
        className={fieldClasses}
      />
    </div>
  )
}
