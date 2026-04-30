import React from 'react'
import { useAuth
 } from '../context/AuthContext'


function ProtectedRoute( { children }) {

    const { user , loading } = useAuth()

    if(loading){

        return(
             <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
        )
    }
  if(!user){
    return <Navigate to="/login"  replace/>
  }
  return children;
}

export default ProtectedRoute