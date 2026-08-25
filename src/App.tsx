import { Route, Routes } from 'react-router-dom'
import Home from '@/pages/Home'
import ChapterDetail from '@/pages/ChapterDetail'
import ChapterAll from '@/pages/ChapterAll'
import SelfTest from '@/pages/SelfTest'
import TestComplete from '@/pages/TestComplete'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chapter/all" element={<ChapterAll />} />
      <Route path="/chapter/:n" element={<ChapterDetail />} />
      <Route path="/chapter/:n/test/:mode" element={<SelfTest />} />
      <Route path="/chapter/:n/test/:mode/complete" element={<TestComplete />} />
    </Routes>
  )
}
