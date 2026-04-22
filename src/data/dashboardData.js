import { Briefcase, TrendingUp, Award, XCircle } from 'lucide-react'

export const stats = [
  { label: 'Applied', value: 12, icon: Briefcase, color: 'violet', change: '+3 this week' },
  { label: 'Interviews', value: 4, icon: TrendingUp, color: 'amber', change: '+1 this week' },
  { label: 'Offers', value: 1, icon: Award, color: 'emerald', change: '🎉 congrats!' },
  { label: 'Rejected', value: 3, icon: XCircle, color: 'rose', change: 'Keep going!' },
]

export const recentJobs = [
  { company: 'Stripe', role: 'Frontend Engineer', status: 'Interview', date: 'Apr 18' },
  { company: 'Vercel', role: 'React Developer', status: 'Applied', date: 'Apr 15' },
  { company: 'Linear', role: 'SDE II', status: 'Offer', date: 'Apr 10' },
  { company: 'Figma', role: 'Full Stack Engineer', status: 'Rejected', date: 'Apr 8' },
]

export const statusStyles = {
  Applied: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  Interview: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Offer: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Rejected: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
}

export const colorStyles = {
  violet: { icon: 'bg-violet-500/10 text-violet-400', value: 'text-violet-400' },
  amber: { icon: 'bg-amber-500/10 text-amber-400', value: 'text-amber-400' },
  emerald: { icon: 'bg-emerald-500/10 text-emerald-400', value: 'text-emerald-400' },
  rose: { icon: 'bg-rose-500/10 text-rose-400', value: 'text-rose-400' },
}