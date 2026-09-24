import { useEventBoard } from '@/lib/useEventBoard'
import EventShareFrame from '@/components/event/EventShareFrame'
import EventParticipantCard from '@/components/event/EventParticipantCard'

const SLOT_COUNT = 50 // 한 교실 최대 인원 — 빈 칸을 미리 보여줘서 바둑판처럼 보이게 한다

// 공유화면 — 카드 버전 (/focus-card)
export default function EventCardBoard() {
  const { round, isOpen, participants, length } = useEventBoard()
  const doneCount = participants.filter((p) => p.mode && p.position >= length).length
  const emptySlots = Math.max(0, SLOT_COUNT - participants.length)

  return (
    <EventShareFrame round={round} isOpen={isOpen} subtitle="카드를 다 쌓으면 뱃지가 초록색으로 바뀌어요">
      <div className="mb-3.5 flex flex-wrap gap-2">
        <span className="rounded-full bg-navy/[0.06] px-3.5 py-1.5 text-[12px] font-bold tabular-nums text-navy">
          {participants.length}명 접속
        </span>
        <span className="rounded-full bg-[#2F9E5F]/[0.14] px-3.5 py-1.5 text-[12px] font-bold tabular-nums text-[#237A49]">
          {doneCount}명 완료
        </span>
      </div>

      <div className="rounded-[18px] border border-navy/10 bg-white/50 p-3">
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(152px,1fr))] gap-2.5">
          {participants.map((p) => (
            <EventParticipantCard key={p.userId} row={p} total={length} />
          ))}
          {Array.from({ length: emptySlots }, (_, i) => (
            <li key={`empty-${i}`} aria-hidden className="min-h-[108px] rounded-[14px] border-[1.5px] border-dashed border-navy/[0.12]" />
          ))}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <i className="h-3.5 w-3.5 rounded border-[1.5px] border-dashed border-navy/30" />방식 고르는 중
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="h-3.5 w-3.5 rounded bg-gold/45" />한 번에 쌓기
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="h-3.5 w-3.5 rounded bg-teal/45" />한 절씩 쌓기
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="h-3.5 w-3.5 rounded bg-navy/15" />쌓는 중 (쌓은 카드 수 / 전체)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="h-3.5 w-3.5 rounded bg-[#2F9E5F]" />다 쌓음
        </span>
      </div>
    </EventShareFrame>
  )
}
