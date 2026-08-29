import type { Grade } from '@/lib/auth'
import { MODE_LABEL, formatDateTime, type TestMode } from '@/lib/testModes'

export function GradeBadge({ grade }: { grade: Grade }) {
  return (
    <span className="shrink-0 rounded-full bg-gold/[0.15] px-2 py-0.5 text-[10.5px] font-bold text-gold-deep">
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
