import type { Grade } from '@/lib/auth'
import { MODE_LABEL, formatDateTime, type TestMode } from '@/lib/testModes'

const GRADE_BADGE_STYLE: Record<'mid' | 'high' | 'teacher', string> = {
  mid: 'bg-gold/[0.15] text-gold-deep',
  high: 'bg-teal/[0.15] text-teal-deep',
  teacher: 'bg-[#5B84B0]/[0.15] text-[#3F6690]',
}

function gradeTier(grade: Grade): 'mid' | 'high' | 'teacher' {
  if (grade === '교사') return 'teacher'
  return grade.startsWith('중') ? 'mid' : 'high'
}

export function GradeBadge({ grade }: { grade: Grade }) {
  return (
    <span className={'shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-bold ' + GRADE_BADGE_STYLE[gradeTier(grade)]}>
      {grade}
    </span>
  )
}

export function ModeBadge({ mode }: { mode: TestMode }) {
  return (
    <span className="shrink-0 rounded-full bg-teal/[0.15] px-2 py-0.5 text-[10.5px] font-bold text-teal-deep">
      {MODE_LABEL[mode]}
    </span>
  )
}

export function DateBadge({ iso }: { iso: string }) {
  return (
    <span className="shrink-0 rounded-full bg-navy/[0.08] px-2 py-0.5 text-[10.5px] font-bold text-navy">
      {formatDateTime(iso)}
    </span>
  )
}
