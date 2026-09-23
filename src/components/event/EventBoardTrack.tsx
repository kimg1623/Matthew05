import { useMemo } from 'react'
import type { EventBoardRow } from '@/lib/eventProgress'

function givenName(fullName: string): string {
  return fullName.length <= 1 ? fullName : fullName.slice(1, 3)
}

function hue(id: string): number {
  // 문자열 해시를 황금각(137.508°)으로 펼쳐서, id가 비슷해도 색상환에서는
  // 서로 멀리 떨어지도록 한다.
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 9973
  return Math.round((h * 137.508) % 360)
}

function FootTrail() {
  const parts = useMemo(() => {
    const w = 920
    const h = 16
    const out: JSX.Element[] = []
    for (let x = 16, i = 0; x < w - 8; x += 30, i++) {
      const flip = i % 2 === 0 ? 1 : -1
      const cy = h / 2 + flip * 3
      out.push(
        <ellipse
          key={x}
          cx={x}
          cy={cy}
          rx={3.8}
          ry={5.8}
          transform={`rotate(${flip * 18} ${x} ${cy})`}
          fill="#2B3A55"
          fillOpacity={0.16}
        />,
      )
    }
    return out
  }, [])
  return (
    <svg
      viewBox="0 0 920 16"
      preserveAspectRatio="none"
      className="pointer-events-none absolute bottom-[31px] left-0 right-0 h-4 w-full"
    >
      {parts}
    </svg>
  )
}

function FinishFlag() {
  return (
    <div className="absolute bottom-[38px] right-3.5">
      <svg width="26" height="30" viewBox="0 0 26 30" fill="none">
        <line x1="3" y1="2" x2="3" y2="28" stroke="#1F2B40" strokeWidth={2.4} strokeLinecap="round" />
        <path d="M3 3 L21 3 L16 8 L21 13 L3 13 Z" fill="#F4A259" />
        <path d="M3 3 L21 3 L16 8 L21 13 L3 13 Z" fill="none" stroke="#1F2B40" strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export default function EventBoardTrack({ rows, length }: { rows: EventBoardRow[]; length: number }) {
  const cells = Array.from({ length: length + 1 }, (_, i) => i)

  return (
    <div className="overflow-x-auto pb-1.5">
      <div className="relative min-w-[560px] pt-2.5" style={{ height: 260 }}>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-10 rounded-[10px]"
          style={{
            top: 0,
            backgroundImage:
              'repeating-linear-gradient(180deg, rgba(91,154,139,0.05) 0px, rgba(91,154,139,0.05) 34px, transparent 34px, transparent 68px)',
          }}
        />
        <div
          className="absolute bottom-[38px] left-0 right-0 h-[3px] rounded"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, #E08E3E 0, #E08E3E 10px, transparent 10px, transparent 18px)',
          }}
        />
        <FootTrail />
        <FinishFlag />

        <div className="relative flex h-full items-end gap-1">
          {cells.map((cell) => {
            const here = rows.filter((r) => r.position === cell)
            const visible = here.slice(0, 5)
            const overflow = here.length - visible.length
            const isFinish = cell === length
            return (
              <div
                key={cell}
                className={
                  'relative flex h-full min-w-[44px] flex-1 flex-col-reverse items-center gap-1 pb-[41px] ' +
                  (isFinish ? 'rounded-t-lg bg-gradient-to-t from-transparent to-gold/[0.18]' : '')
                }
              >
                {visible.map((r) => (
                  <div
                    key={r.userId}
                    title={r.name}
                    className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-2 border-[#FFF9F0] text-[10.5px] font-extrabold text-white shadow-[0_2px_5px_rgba(31,43,64,0.28)]"
                    style={{ backgroundColor: `hsl(${hue(r.userId)}, 62%, 52%)` }}
                  >
                    {givenName(r.name)}
                  </div>
                ))}
                {overflow > 0 && (
                  <div className="flex h-[22px] w-[30px] items-center justify-center rounded-lg bg-navy/10 text-[9.5px] font-extrabold text-navy">
                    +{overflow}
                  </div>
                )}
                <div className={'absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-extrabold ' + (isFinish ? 'text-gold-deep' : 'text-text-muted')}>
                  {cell === 0 ? '출발' : cell}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
