import { useEventBoard } from '@/lib/useEventBoard'
import EventShareFrame from '@/components/event/EventShareFrame'
import EventBoardTrack from '@/components/event/EventBoardTrack'

// 공유화면 — 레이싱 버전 (/focus-racing)
export default function EventBoard() {
  const { round, isOpen, participants, length } = useEventBoard()
  // 접속만 하고 아직 방식을 안 고른 학생은 말판에 올리지 않는다(방식을 고르면 출발선에 등장).
  const racers = participants.filter((p) => p.mode)

  return (
    <EventShareFrame round={round} isOpen={isOpen} subtitle="정답을 맞힐 때마다 즉시 전진해요">
      <EventBoardTrack rows={racers} length={length} />

      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-navy/[0.06] px-3.5 py-1.5 text-[11.5px] font-bold text-navy">{racers.length}명 참여 중</span>
        <span className="rounded-full bg-navy/[0.06] px-3.5 py-1.5 text-[11.5px] font-bold text-navy">출발선(0) → {length}절 완주</span>
      </div>
    </EventShareFrame>
  )
}
