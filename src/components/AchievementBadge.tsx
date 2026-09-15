import type { Achievement } from '@/lib/achievements'

function tint(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function AchievementBadge({ achievement, onClick }: { achievement: Achievement; onClick: () => void }) {
  const { unlocked, iconName, accentName, accentHex, title } = achievement

  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 text-center">
      <div
        className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: unlocked ? tint(accentHex, 0.15) : undefined }}
      >
        <div className={unlocked ? undefined : 'flex h-14 w-14 items-center justify-center rounded-full bg-navy/[0.05]'}>
          <img
            src={`/icons/${iconName}-${accentName}.svg`}
            alt=""
            className={'h-7 w-7 ' + (unlocked ? '' : 'opacity-40 grayscale')}
          />
        </div>
        {!unlocked && (
          <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-navy/70">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
        )}
      </div>
      <span className={'line-clamp-2 text-[10.5px] font-bold leading-tight ' + (unlocked ? 'text-navy' : 'text-text-muted')}>
        {title}
      </span>
    </button>
  )
}
