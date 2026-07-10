// Single source of truth for the enums the database enforces.
// These must stay in sync with the CHECK constraints in
// supabase/migrations/0001_jobz_schema.sql — if they drift, inserts fail.

export const JOB_STATUSES = [
  'Saved',
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
]

export const STATUS_BADGE = {
  Saved:     'text-slate-700 bg-slate-500/10 border-slate-500/20 dark:text-slate-300',
  Applied:   'text-violet-700 bg-violet-500/10 border-violet-500/20 dark:text-violet-400',
  Screening: 'text-sky-700 bg-sky-500/10 border-sky-500/20 dark:text-sky-400',
  Interview: 'text-amber-700 bg-amber-500/10 border-amber-500/20 dark:text-amber-400',
  Offer:     'text-emerald-700 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400',
  Rejected:  'text-rose-700 bg-rose-500/10 border-rose-500/20 dark:text-rose-400',
  Withdrawn: 'text-zinc-600 bg-zinc-500/10 border-zinc-500/20 dark:text-zinc-400',
}

// Selected state for the status picker in the job modals.
export const STATUS_ACTIVE = {
  Saved:     'bg-slate-500/15 border-slate-400/50 text-slate-700 dark:text-slate-300',
  Applied:   'bg-violet-500/15 border-violet-500/50 text-violet-700 dark:text-violet-400',
  Screening: 'bg-sky-500/10 border-sky-400/45 text-sky-700 dark:text-sky-300',
  Interview: 'bg-amber-500/10 border-amber-400/45 text-amber-700 dark:text-amber-300',
  Offer:     'bg-emerald-500/10 border-emerald-400/45 text-emerald-700 dark:text-emerald-400',
  Rejected:  'bg-rose-500/10 border-rose-400/45 text-rose-700 dark:text-rose-400',
  Withdrawn: 'bg-zinc-500/10 border-zinc-400/45 text-zinc-700 dark:text-zinc-300',
}

export const STATUS_INACTIVE =
  'border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-white/40 ' +
  'hover:text-gray-700 dark:hover:text-white/60 hover:border-gray-300 dark:hover:border-white/20'

export const WORK_TYPES = ['On-site', 'Hybrid', 'Remote']

export const PRIORITIES = ['Low', 'Medium', 'High']

export const PRIORITY_BADGE = {
  Low:    'text-zinc-600 bg-zinc-500/10 border-zinc-500/20 dark:text-zinc-400',
  Medium: 'text-sky-700 bg-sky-500/10 border-sky-500/20 dark:text-sky-400',
  High:   'text-orange-700 bg-orange-500/10 border-orange-500/20 dark:text-orange-400',
}

export const INTERVIEW_TYPES = ['Phone', 'Video', 'Technical', 'HR', 'Behavioral', 'Final']

export const INTERVIEW_STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled']

export const EMAIL_TYPES = [
  { key: 'followup',               label: 'Follow-up' },
  { key: 'thankyou',               label: 'Thank you' },
  { key: 'interview_confirmation', label: 'Interview confirmation' },
  { key: 'interview_reschedule',   label: 'Reschedule interview' },
  { key: 'withdrawal',             label: 'Withdraw application' },
  { key: 'recruiter_outreach',     label: 'Recruiter outreach' },
  { key: 'status_inquiry',         label: 'Status inquiry' },
]

export const JOB_SOURCES = [
  'LinkedIn', 'Indeed', 'Company website', 'Referral',
  'Naukri', 'AngelList', 'Job board', 'Other',
]
