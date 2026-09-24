// Score bands are deliberately strict — an encouraging-but-wrong "green at
// 60" would mislead someone into applying with a weak resume.
export function scoreTone(score) {
  if (score >= 80) {
    return { stroke: '#10B981', text: 'text-emerald-600 dark:text-emerald-400', label: 'Strong match' }
  }
  if (score >= 65) {
    return { stroke: '#06B6D4', text: 'text-cyan-600 dark:text-cyan-400', label: 'Decent match' }
  }
  if (score >= 45) {
    return { stroke: '#F59E0B', text: 'text-amber-600 dark:text-amber-400', label: 'Needs work' }
  }
  return { stroke: '#F43F5E', text: 'text-rose-600 dark:text-rose-400', label: 'Weak match' }
}
