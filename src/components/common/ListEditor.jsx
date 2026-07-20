import { useState } from 'react'
import { Plus, Trash2, ChevronDown } from 'lucide-react'
import { fieldClasses, Label } from './Field'

// Education, experience, projects and certifications are all "a list of
// records with the same shape", so they share one editor driven by a field
// config instead of four near-identical components.
//
// fields: [{ name, label, type?, placeholder?, span?, rows? }]
//   type: 'text' | 'date' | 'month' | 'url' | 'textarea' | 'checkbox'
//   span: 2 makes the field full width on the two-column grid

export default function ListEditor({
  items = [],
  onChange,
  fields,
  newItem,
  addLabel = 'Add entry',
  emptyLabel = 'Nothing added yet.',
  titleKey,
  subtitleKey,
}) {
  // Entries collapse to a single row so a long list stays scannable.
  const [openIndex, setOpenIndex] = useState(null)

  const updateItem = (index, key, value) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)))
  }

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index))
    setOpenIndex(null)
  }

  const addItem = () => {
    onChange([...items, newItem()])
    setOpenIndex(items.length) // open the entry that was just added
  }

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-xs leading-relaxed text-gray-400 dark:border-white/[0.08] dark:text-white/25">
          {emptyLabel}
        </p>
      )}

      {items.map((item, index) => {
        const isOpen = openIndex === index

        return (
          <div
            key={index}
            className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-white/[0.06] dark:bg-white/[0.02]"
          >
            <div className="flex items-center gap-2 px-3 py-2.5">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform dark:text-white/30 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />

                <span className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {(titleKey && item[titleKey]) || `Untitled ${index + 1}`}
                </span>

                {subtitleKey && item[subtitleKey] && (
                  <span className="hidden truncate text-xs text-gray-400 dark:text-white/25 sm:inline">
                    · {item[subtitleKey]}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => removeItem(index)}
                aria-label="Remove entry"
                className="shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-rose-500/10 hover:text-rose-600 dark:text-white/25 dark:hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {isOpen && (
              <div className="grid grid-cols-1 gap-3 border-t border-gray-200 p-3 dark:border-white/[0.06] sm:grid-cols-2">
                {fields.map((field) => {
                  const value = item[field.name] ?? (field.type === 'checkbox' ? false : '')
                  const spanCls = field.span === 2 ? 'sm:col-span-2' : ''

                  if (field.type === 'checkbox') {
                    return (
                      <label
                        key={field.name}
                        className={`flex cursor-pointer items-center gap-2 text-xs text-gray-600 dark:text-gray-400 ${spanCls}`}
                      >
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateItem(index, field.name, e.target.checked)}
                          className="h-3.5 w-3.5 cursor-pointer accent-violet-500"
                        />
                        {field.label}
                      </label>
                    )
                  }

                  if (field.type === 'textarea') {
                    return (
                      <div key={field.name} className={spanCls}>
                        <Label>{field.label}</Label>
                        <textarea
                          rows={field.rows || 3}
                          value={value}
                          placeholder={field.placeholder}
                          onChange={(e) => updateItem(index, field.name, e.target.value)}
                          className={`${fieldClasses} resize-none leading-relaxed`}
                        />
                      </div>
                    )
                  }

                  return (
                    <div key={field.name} className={spanCls}>
                      <Label>{field.label}</Label>
                      <input
                        type={field.type || 'text'}
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(e) => updateItem(index, field.name, e.target.value)}
                        className={fieldClasses}
                      />
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      <button
        type="button"
        onClick={addItem}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-2.5 text-xs font-medium text-gray-500 transition-colors hover:border-violet-400 hover:text-violet-600 dark:border-white/[0.1] dark:text-white/40 dark:hover:border-violet-400/50 dark:hover:text-violet-400"
      >
        <Plus className="h-3.5 w-3.5" />
        {addLabel}
      </button>
    </div>
  )
}
