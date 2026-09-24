import type { EventMode } from '@/lib/eventProgress'

function Difficulty({ stars }: { stars: number }) {
  return (
    <span className="ml-auto flex shrink-0 items-center gap-1.5" aria-label={`난이도 별 ${stars}개`}>
      <span className="text-[11px] font-bold text-text-muted">난이도</span>
      <span className="flex gap-0.5">
        {Array.from({ length: stars }, (_, i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#F4A259" stroke="#E08E3E" strokeWidth={1.6} strokeLinejoin="round">
            <path d="M12 3.5l2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.3 9.9l6-.9L12 3.5z" />
          </svg>
        ))}
      </span>
    </span>
  )
}

export default function EventModeSelect({ onSelect }: { onSelect: (mode: EventMode) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => onSelect('one')}
        className="rounded-[18px] border-[1.5px] border-navy/[0.08] bg-white p-4 text-left shadow-[0_3px_12px_rgba(31,43,64,0.06)]"
      >
        <div className="flex items-center gap-2 text-[15px] font-extrabold text-navy">
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-teal/[0.16] text-[13px] text-teal-deep">🧩</span>
          한 절씩 구절 쌓기
          <Difficulty stars={1} />
        </div>
        <div className="mt-2 text-[12.5px] leading-relaxed text-text-muted">
          한 절씩 차근차근. "테스트"를 누르면 그 절만 문제가 열리고, 원문을 다시 누르면 취소돼요.
        </div>
      </button>
      <button
        onClick={() => onSelect('all')}
        className="rounded-[18px] border-[1.5px] border-navy/[0.08] bg-white p-4 text-left shadow-[0_3px_12px_rgba(31,43,64,0.06)]"
      >
        <div className="flex items-center gap-2 text-[15px] font-extrabold text-navy">
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-gold/[0.18] text-[13px] text-gold-deep">📚</span>
          한 번에 구절 쌓기
          <Difficulty stars={2} />
        </div>
        <div className="mt-2 text-[12.5px] leading-relaxed text-text-muted">
          범위의 모든 절을 먼저 쭉 보고, 테스트를 시작하면 이어서 순서대로 풀어요.
        </div>
      </button>
    </div>
  )
}
