import React from 'react'
import Logo from '../Logo/Logo'
const Footer = () => {
  return (
     <footer className="border-t border-white/[0.06] px-8 py-5 flex items-center justify-between">
        <Logo compact showTagline={false} />
        <p className="text-xs text-gray-700">© 2025 Career Log. Built like a real product.</p>
      </footer>
  )
}

export default Footer
