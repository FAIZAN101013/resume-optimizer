
import React from 'react'
import { motion } from 'framer-motion'


const DashboardPreview = ({fadeUp}) => {
  return (
    
        <motion.div variants={fadeUp} className="w-full max-w-5xl">
          <div
            role="img"
            aria-label="CareerOS dashboard preview"
            className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05]">
              <div className="w-3 h-3 rounded-full bg-red-500/70" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <div className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="text-xs text-gray-600 ml-2">CareerOS — Dashboard</span>
            </div>

            {/* Mock content */}
            <div className="p-6 grid grid-cols-3 gap-4">
              {/* Resume score */}
              <div className="col-span-1 rounded-lg bg-white/[0.04] border border-white/[0.05] p-4">
                <p className="text-[10px] text-gray-600 mb-1">Resume score</p>
                <p className="text-2xl font-semibold text-gray-200">87<span className="text-sm text-gray-500">/100</span></p>
                <div className="h-1 bg-white/[0.06] rounded-full mt-3 overflow-hidden">
                  <div className="h-full w-[87%] bg-violet-500 rounded-full" />
                </div>
                <p className="text-[10px] text-emerald-400 mt-2">+12 this week</p>
              </div>

              {/* Applications */}
              <div className="col-span-1 rounded-lg bg-white/[0.04] border border-white/[0.05] p-4">
                <p className="text-[10px] text-gray-600 mb-1">Applications</p>
                <p className="text-2xl font-semibold text-gray-200">24</p>
                <div className="flex gap-1.5 mt-3 flex-wrap">
                  <span className="text-[9px] px-2 py-0.5 rounded-full border border-violet-400/30 bg-violet-400/[0.06] text-violet-400">6 interviews</span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full border border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-400">2 offers</span>
                </div>
              </div>

              {/* ATS match */}
              <div className="col-span-1 rounded-lg bg-white/[0.04] border border-white/[0.05] p-4">
                <p className="text-[10px] text-gray-600 mb-1">ATS match</p>
                <p className="text-2xl font-semibold text-gray-200">94%</p>
                <div className="h-1 bg-white/[0.06] rounded-full mt-3 overflow-hidden">
                  <div className="h-full w-[94%] bg-emerald-500 rounded-full" />
                </div>
              </div>

              {/* Pipeline */}
              <div className="col-span-3 rounded-lg bg-white/[0.04] border border-white/[0.05] p-4">
                <p className="text-[10px] text-gray-600 mb-3">Pipeline</p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Applied',    count: 14, color: 'violet' },
                    { label: 'Screening',  count: 6,  color: 'cyan' },
                    { label: 'Interview',  count: 2,  color: 'amber' },
                    { label: 'Offer',      count: 2,  color: 'emerald' },
                  ].map(col => (
                    <div
                      key={col.label}
                      className={`rounded-md border px-3 py-2 text-[10px] font-medium
                        ${col.color === 'violet'  ? 'bg-violet-500/10  border-violet-500/20  text-violet-400'  : ''}
                        ${col.color === 'cyan'    ? 'bg-cyan-500/10    border-cyan-500/20    text-cyan-400'    : ''}
                        ${col.color === 'amber'   ? 'bg-amber-500/10   border-amber-500/20   text-amber-400'   : ''}
                        ${col.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : ''}
                      `}
                    >
                      {col.label} ({col.count})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
     
  )
}

export default DashboardPreview