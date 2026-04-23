import { X, Building2, Briefcase, Calendar, Mail, Users, FileText } from 'lucide-react'
import Button from '../Button'

const STATUS_BADGE = {
  Applied:   'text-violet-400 bg-violet-500/10 border-violet-500/20',
  Interview: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Offer:     'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Rejected:  'text-rose-400 bg-rose-500/10 border-rose-500/20',
}

export default function JobViewModal({ job, onClose, onEdit }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-[480px] bg-[#13131c] border border-white/[0.09] rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-start justify-between p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center text-base font-bold text-gray-300">
              {job.company[0]}
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{job.company}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{job.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${STATUS_BADGE[job.status]}`}>
              {job.status}
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 transition-colors flex items-center justify-center text-lg leading-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Details ── */}
        <div className="p-6 space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <Detail icon={Calendar} label="Applied On" value={job.date || '—'} />
            <Detail icon={Mail} label="Recruiter Email" value={job.companyEmail || '—'} />
            <Detail
              icon={Users}
              label="Referral"
              value={job.isReferral ? job.referralEmail || 'Yes' : 'No'}
            />
            <Detail icon={Briefcase} label="Status" value={job.status} />
          </div>

          {/* Notes */}
          {job.notes && (
            <div className="pt-2 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600 uppercase tracking-widest font-medium mb-2">
                <FileText className="w-3 h-3" />
                Notes
              </div>
              <p className="text-sm text-gray-400 leading-relaxed bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5">
                {job.notes}
              </p>
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="flex gap-2 justify-end px-6 pb-6">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button onClick={onEdit}>Edit Application</Button>
        </div>

      </div>
    </div>
  )
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] text-gray-600 uppercase tracking-widest font-medium mb-1">
        <Icon className="w-3 h-3" strokeWidth={1.75} />
        {label}
      </div>
      <div className="text-sm text-gray-300 truncate">{value}</div>
    </div>
  )
}