import React from 'react'
import { BrowserRouter, Routes,Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Optimize from './pages/Optimizer'

import Tracker from './pages/Tracker'



function App() {
  return (
   <BrowserRouter>
    <div className='bg-gray-300 min-h-screen text-white'> 
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/optimize' element={<Optimize />} />
        <Route path='/tracker' element={<Tracker />} />
      </Routes>
      </div>
   </BrowserRouter>
  )
}

export default App