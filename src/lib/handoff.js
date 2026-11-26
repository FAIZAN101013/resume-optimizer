// One-shot handoff between pages that stay deliberately separate.
//
// The builder and optimizer are distinct pages by design, but "score the
// resume I just built" shouldn't mean copy-pasting between two tabs of the
// same app. The sender stashes, the receiver takes — and taking clears it,
// so a stale handoff can never silently overwrite later work.

const RESUME_TEXT_KEY = 'jobz:handoff:resumeText'

export function stashResumeText(text) {
  try {
    localStorage.setItem(RESUME_TEXT_KEY, text)
  } catch {
    /* storage unavailable — the button still navigates, just without the payload */
  }
}

export function takeResumeText() {
  try {
    const value = localStorage.getItem(RESUME_TEXT_KEY)
    localStorage.removeItem(RESUME_TEXT_KEY)
    return value
  } catch {
    return null
  }
}
