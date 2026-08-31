import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import ChapterProgress, { type AttemptRow } from '@/components/ChapterProgress'

export default function My() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [attempts, setAttempts] = useState<AttemptRow[]>([])
  const [loading, setLoading] = useState(true)

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    if (!user) return
    let active = true
    supabase
      .from('test_attempts')
      .select('id, chapter, mode, correct, total, gradable, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!active) return
        setAttempts((data ?? []) as AttemptRow[])
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user])

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-cream pb-24">
      <div className="bg-navy-deep px-6 pb-8 pt-9">
        <div className="text-[12.5px] font-bold text-gold">마태복음 5장</div>
        <div className="mt-2 text-[26px] font-extrabold leading-tight text-cream">MY</div>
        <div className="mt-3.5 h-[3px] w-10 rounded bg-gold" />
      </div>

      <div className="flex items-center justify-between gap-3.5 px-5 pt-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy-deep text-xl font-extrabold text-gold">
            {profile?.name?.[0] ?? '?'}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[17px] font-extrabold text-navy">{profile?.name ?? '-'}</span>
            {profile && (
              <span className="shrink-0 rounded-full bg-gold/[0.15] px-2 py-0.5 text-[11px] font-bold text-gold-deep">
                {profile.grade}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="shrink-0 rounded-full px-3 py-1.5 text-[12.5px] font-bold text-text-muted"
        >
          로그아웃
        </button>
      </div>

      <ChapterProgress attempts={attempts} loading={loading} />
    </div>
  )
}
