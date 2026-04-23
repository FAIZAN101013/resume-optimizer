import React from 'react'
import { Zap } from 'lucide-react'
const Footer = () => {
  return (
     <footer className="border-t border-white/[0.06] px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-violet-400 fill-violet-400" />
          <span className="text-xs text-gray-600 font-medium">CareerOS</span>
        </div>
        <p className="text-xs text-gray-700">© 2025 CareerOS. Built like a real product.</p>
      </footer>
  )
}

export default Footer