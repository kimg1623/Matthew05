import { Route, Routes } from 'react-router-dom'
import Home from '@/pages/Home'
import ChapterDetail from '@/pages/ChapterDetail'
import ChapterAll from '@/pages/ChapterAll'
import SelfTest from '@/pages/SelfTest'
import TestComplete from '@/pages/TestComplete'
import Test from '@/pages/Test'
import Leaderboard from '@/pages/Leaderboard'
import My from '@/pages/My'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Good from '@/pages/Good'
import RequireAuth from '@/components/RequireAuth'
import RequireTeacher from '@/components/RequireTeacher'
import AppShell from '@/components/AppShell'
import SupabaseSetupNotice from '@/components/SupabaseSetupNotice'
import { isSupabaseConfigured } from '@/lib/supabase'

export default function App() {
  if (!isSupabaseConfigured) return <SupabaseSetupNotice />

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/good" element={<Good />} />

      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
        <Route path="/leaderboard" element={<RequireTeacher><Leaderboard /></RequireTeacher>} />
        <Route path="/my" element={<My />} />
      </Route>

      <Route path="/chapter/all" element={<RequireAuth><ChapterAll /></RequireAuth>} />
      <Route path="/chapter/:n" element={<RequireAuth><ChapterDetail /></RequireAuth>} />
      <Route path="/chapter/:n/test/:mode" element={<RequireAuth><SelfTest /></RequireAuth>} />
      <Route path="/chapter/:n/test/:mode/complete" element={<RequireAuth><TestComplete /></RequireAuth>} />
    </Routes>
  )
}
