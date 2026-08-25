import type { Week } from '@/lib/data'
import { accentTextHexForChapter, iconUrlForVerse } from '@/lib/icons'

type ChapterCardProps = {
  week: Week
  variant?: 'list' | 'compact'
  onClick?: () => void
}

export default function ChapterCard({ week, variant = 'list', onClick }: ChapterCardProps) {
  const accentText = accentTextHexForChapter(week.n)
  const iconSrc = iconUrlForVerse(week.from, week.n)
  const isCompact = variant === 'compact'

  return (
    <div
      onClick={onClick}
      className={
        isCompact
          ? 'flex items-center gap-3 rounded-2xl bg-cream p-3.5'
          : 'flex cursor-pointer items-center gap-3.5 rounded-[20px] bg-white p-4 shadow-[0_2px_10px_rgba(31,43,64,0.08)]'
      }
    >
      <img src={iconSrc} alt="" className={isCompact ? 'h-11 w-11 shrink-0' : 'h-[52px] w-[52px] shrink-0'} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-[13px] font-bold" style={{ color: accentText }}>
            {week.n}챕터
          </span>
          <span className="text-xs text-text-muted">· {week.range}</span>
        </div>
        <div className={isCompact ? 'mt-0.5 text-sm font-bold text-navy' : 'mt-[3px] text-[15.5px] font-bold leading-tight text-navy'}>
          {week.title}
        </div>
        {!isCompact && (
          <div className="mt-[5px] line-clamp-1 text-[12.5px] leading-snug text-text-muted">{week.tip}</div>
        )}
      </div>
      {!isCompact && (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-navy/35">
          <path d="M9 6l6 6-6 6" />
        </svg>
      )}
    </div>
  )
}
