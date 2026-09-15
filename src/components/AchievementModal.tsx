import type { Achievement } from '@/lib/achievements'

function tint(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function AchievementModal({ achievement, onClose }: { achievement: Achievement | null; onClose: () => void }) {
  if (!achievement) return null
  const { unlocked, iconName, accentName, accentHex, title, unlockedDescription, lockedHint, progress } = achievement

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-navy-deep/40 sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-[420px] rounded-t-[24px] bg-cream p-6 pb-8 sm:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-navy/[0.08] text-[15px] font-bold text-navy"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 pb-2 pt-1 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: unlocked ? tint(accentHex, 0.15) : undefined }}
          >
            <div className={unlocked ? undefined : 'flex h-20 w-20 items-center justify-center rounded-full bg-navy/[0.05]'}>
              <img
                src={`/icons/${iconName}-${accentName}.svg`}
                alt=""
                className={'h-10 w-10 ' + (unlocked ? '' : 'opacity-40 grayscale')}
              />
            </div>
          </div>
          <div className="text-[17px] font-extrabold text-navy">{title}</div>
          <div className="text-[13.5px] leading-relaxed text-text-muted">
            {unlocked ? unlockedDescription : lockedHint}
          </div>
          {!unlocked && progress && (
            <div className="mt-1 flex w-full flex-col gap-1.5">
              <div className="h-2 w-full overflow-hidden rounded-full bg-navy/[0.08]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.round((progress.current / progress.target) * 100)}%`,
                    backgroundColor: accentHex,
                  }}
                />
              </div>
              <div className="text-[12px] font-bold text-text-muted">
                {progress.current}/{progress.target}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
