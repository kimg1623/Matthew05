import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import type { AttemptRow } from '@/components/ChapterProgress'
import { computeAchievements, type Achievement, type AchievementCategory } from '@/lib/achievements'
import AchievementBadge from '@/components/AchievementBadge'
import AchievementModal from '@/components/AchievementModal'

const SECTIONS: { category: AchievementCategory; title: string }[] = [
  { category: 'attendance', title: '출석' },
  { category: 'quest', title: '퀘스트' },
  { category: 'challenge', title: '도전' },
]

export default function Achievements() {
  const { user } = useAuth()
  const [attempts, setAttempts] = useState<AttemptRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Achievement | null>(null)

  useEffect(() => {
    if (!user) return
    let active = true
    supabase
      .from('test_attempts')
      .select('id, chapter, mode, correct, total, gradable, created_at')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (!active) return
        setAttempts((data ?? []) as AttemptRow[])
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user])

  const achievements = useMemo(() => computeAchievements(attempts), [attempts])

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-cream pb-24">
      <div className="bg-navy-deep px-6 pb-8 pt-9">
        <div className="text-[12.5px] font-bold text-gold">마태복음 5장</div>
        <div className="mt-2 text-[26px] font-extrabold leading-tight text-cream">뱃지 컬렉션</div>
        <div className="mt-3.5 h-[3px] w-10 rounded bg-gold" />
        <div className="mt-3.5 text-[13px] text-cream/65">말씀을 암송하며 뱃지를 획득해보세요!</div>
      </div>

      {loading && <div className="py-16 text-center text-sm text-text-muted">불러오는 중...</div>}

      {!loading &&
        SECTIONS.map(({ category, title }) => {
          const items = achievements.filter((a) => a.category === category)
          const unlockedCount = items.filter((a) => a.unlocked).length
          return (
            <div key={category}>
              <div className="flex items-baseline justify-between px-5 pt-6">
                <span className="text-[12.5px] font-bold text-text-muted">{title}</span>
                <span className="text-[11.5px] font-bold text-text-muted">
                  {unlockedCount}/{items.length}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-y-4 px-4 pt-3">
                {items.map((achievement) => (
                  <AchievementBadge key={achievement.id} achievement={achievement} onClick={() => setSelected(achievement)} />
                ))}
              </div>
            </div>
          )
        })}

      <AchievementModal achievement={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
