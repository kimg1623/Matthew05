import { Route, Routes } from 'react-router-dom'
import Home from '@/pages/Home'
import ChapterDetail from '@/pages/ChapterDetail'
import ChapterAll from '@/pages/ChapterAll'
import SelfTest from '@/pages/SelfTest'
import TestComplete from '@/pages/TestComplete'
import Test from '@/pages/Test'
import Leaderboard from '@/pages/Leaderboard'
import Achievements from '@/pages/Achievements'
import My from '@/pages/My'
import Login from '@/pages/Login'
import Signup from '@/pages/Signup'
import Good from '@/pages/Good'
import Event from '@/pages/Event'
import EventBoard from '@/pages/EventBoard'
import EventCardBoard from '@/pages/EventCardBoard'
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
      <Route path="/focus-racing" element={<EventBoard />} />
      <Route path="/focus-card" element={<EventCardBoard />} />

      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
        <Route path="/leaderboard" element={<RequireTeacher><Leaderboard /></RequireTeacher>} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/my" element={<My />} />
      </Route>

      <Route path="/focus" element={<RequireAuth><Event /></RequireAuth>} />

      <Route path="/chapter/all" element={<RequireAuth><ChapterAll /></RequireAuth>} />
      <Route path="/chapter/:n" element={<RequireAuth><ChapterDetail /></RequireAuth>} />
      <Route path="/chapter/:n/test/:mode" element={<RequireAuth><SelfTest /></RequireAuth>} />
      <Route path="/chapter/:n/test/:mode/complete" element={<RequireAuth><TestComplete /></RequireAuth>} />
    </Routes>
  )
}
