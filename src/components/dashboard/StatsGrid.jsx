import { Briefcase, TrendingUp, Award, XCircle } from 'lucide-react'

const STATUS_CONFIG = {
  Applied:   { icon: Briefcase,  iconCls: 'bg-violet-500/10 text-violet-600 dark:text-violet-400', valueCls: 'text-violet-600 dark:text-violet-400' },
  Interview: { icon: TrendingUp, iconCls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',   valueCls: 'text-amber-600 dark:text-amber-400'  },
  Offer:     { icon: Award,      iconCls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', valueCls: 'text-emerald-600 dark:text-emerald-400' },
  Rejected:  { icon: XCircle,    iconCls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',     valueCls: 'text-rose-600 dark:text-rose-400'   },
}

export default function StatsGrid({ counts }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {Object.entries(STATUS_CONFIG).map(([status, { icon: Icon, iconCls, valueCls }]) => (
        <div
          key={status}
          className="p-4 rounded-xl bg-white border border-gray-200 hover:border-gray-300 dark:bg-white/[0.02] dark:border-white/[0.06] dark:hover:border-white/[0.1] transition-all duration-200"
        >
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${iconCls}`}>
            <Icon className="w-4 h-4" strokeWidth={1.75} />
          </div>
          <div className={`text-2xl font-bold mb-0.5 ${valueCls}`}>
            {counts[status]}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-500 font-medium">{status}</div>
        </div>
      ))}
    </div>
  )
}
