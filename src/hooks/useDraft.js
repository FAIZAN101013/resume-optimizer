import { useEffect, useRef, useState } from 'react'

const PREFIX = 'jobz:draft:'

/**
 * State that survives navigation.
 *
 * Every page keeps its work in local state, so moving from the optimizer to
 * the builder and back used to throw away whatever had been typed. This keeps
 * a copy in localStorage under a stable key and restores it on mount.
 *
 * Not a replacement for saving: drafts are per browser and are meant to
 * survive a click, not to be the record. The database is still the record.
 */
export function useDraft(key, initialValue) {
  const storageKey = PREFIX + key

  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw === null ? initialValue : JSON.parse(raw)
    } catch {
      // Private mode, quota, or a value written by an older version.
      return initialValue
    }
  })

  // Skip the write on first render — it would only rewrite what we just read,
  // and on a parse failure it would overwrite a recoverable value with the
  // fallback.
  const mounted = useRef(false)

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true
      return
    }

    try {
      if (value === undefined || value === null) {
        localStorage.removeItem(storageKey)
      } else {
        localStorage.setItem(storageKey, JSON.stringify(value))
      }
    } catch {
      // Out of quota or storage blocked. Losing the draft is acceptable;
      // breaking the page is not.
    }
  }, [storageKey, value])

  return [value, setValue]
}

/** Forget one draft — used after a save, so stale work is not restored. */
export function clearDraft(key) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* nothing to do */
  }
}
