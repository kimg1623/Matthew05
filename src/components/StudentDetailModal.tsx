import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { GradeBadge } from '@/components/Badges'
import ChapterProgress, { type AttemptRow } from '@/components/ChapterProgress'
import type { Grade } from '@/lib/auth'

type Props = {
  userId: string
  name: string
  grade: Grade
  onClose: () => void
  onEdit: () => void
}

export default function StudentDetailModal({ userId, name, grade, onClose, onEdit }: Props) {
  const [attempts, setAttempts] = useState<AttemptRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    supabase
      .from('attempt_feed')
      .select('id, chapter, mode, correct, total, gradable, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!active) return
        setAttempts((data ?? []) as AttemptRow[])
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [userId])

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-navy-deep/40 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[88vh] w-full max-w-[420px] overflow-y-auto rounded-t-[24px] bg-cream pb-7 sm:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 p-5 pb-0">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-navy-deep text-xl font-extrabold text-gold">
              {name[0]}
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-[17px] font-extrabold text-navy">{name}</span>
              <GradeBadge grade={grade} />
              <button
                onClick={onEdit}
                className="flex shrink-0 items-center gap-1 rounded-full bg-navy/[0.08] py-[5px] pl-2 pr-2.5 text-[11.5px] font-bold text-navy"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
                정보 수정
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-navy/[0.08] text-[15px] font-bold text-navy"
          >
            ×
          </button>
        </div>

        <ChapterProgress attempts={attempts} loading={loading} />
      </div>
    </div>
  )
}
