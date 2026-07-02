import Home from './pages/Home'
import Plans from './pages/Plans'
import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/plans" element={<Plans />} />
      </Routes>
    </div>
  )
}

