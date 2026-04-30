import React from 'react'

const AuthBackground = () => {
  return (
     <div className="absolute inset-0 z-0 pointer-events-none">

      {/* Soft gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-pink-500/10" />

      {/* Glow top */}
      <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-[120px]" />

      {/* Glow bottom */}
      <div className="absolute bottom-[-120px] right-1/3 w-[350px] h-[350px] bg-pink-500/20 rounded-full blur-[120px]" />

    </div>
  )
}

export default AuthBackground