import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { closeEventRound, fetchEventRound, openEventRound, subscribeToEventRound, type EventRound } from '@/lib/eventRound'
import { fetchEventBoard, subscribeToEventBoard, type EventBoardRow } from '@/lib/eventProgress'
import EventBoardTrack from '@/components/event/EventBoardTrack'
import EventTeacherActionModal from '@/components/event/EventTeacherActionModal'

const SAFETY_POLL_MS = 15000

export default function EventBoard() {
  const [round, setRound] = useState<EventRound | null>(null)
  const [rows, setRows] = useState<Record<string, EventBoardRow>>({})
  const [startVerse, setStartVerse] = useState(1)
  const [endVerse, setEndVerse] = useState(20)
  const [pendingAction, setPendingAction] = useState<'open' | 'close' | null>(null)
  const [editingRange, setEditingRange] = useState(false)

  const rowsRef = useRef(rows)
  rowsRef.current = rows

  useEffect(() => {
    let active = true
    fetchEventRound().then((r) => active && setRound(r))
    const unsubscribe = subscribeToEventRound((r) => active && setRound(r))
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const isOpen = Boolean(round?.isOpen)

  useEffect(() => {
    if (!isOpen) {
      setRows({}) // 종료된 라운드의 참가자 잔상이 다음 라운드 시작 때 잠깐 보이지 않게 비운다
      return
    }
    let active = true

    async function loadBoard() {
      const board = await fetchEventBoard()
      if (!active) return
      const map: Record<string, EventBoardRow> = {}
      for (const r of board) map[r.userId] = r
      setRows(map)
    }
    loadBoard()

    const unsubscribe = subscribeToEventBoard(
      async (row) => {
        if (!active) return
        const existing = rowsRef.current[row.userId]
        if (existing) {
          setRows((prev) => ({ ...prev, [row.userId]: { ...existing, position: row.position } }))
          return
        }
        // 새로 등장한 참가자 — attempt_feed류 anon 공개 뷰에서 이름만 한 번 조회
        const { data } = await supabase.from('event_board').select('name').eq('user_id', row.userId).maybeSingle()
        if (!active) return
        setRows((prev) => ({ ...prev, [row.userId]: { userId: row.userId, position: row.position, name: data?.name ?? '?' } }))
      },
      (userId) => {
        if (!active) return
        setRows((prev) => {
          const next = { ...prev }
          delete next[userId]
          return next
        })
      },
    )

    const interval = setInterval(loadBoard, SAFETY_POLL_MS)

    return () => {
      active = false
      unsubscribe()
      clearInterval(interval)
    }
  }, [isOpen, round?.updatedAt])

  const length = round?.isOpen && round.startVerse && round.endVerse ? round.endVerse - round.startVerse + 1 : 0
  const showRangeForm = !isOpen || editingRange

  function startEditingRange() {
    if (round?.startVerse) setStartVerse(round.startVerse)
    if (round?.endVerse) setEndVerse(round.endVerse)
    setEditingRange(true)
  }

  return (
    <div
      className="min-h-screen px-6 py-10 sm:px-10"
      style={{ background: 'linear-gradient(180deg, #FFF9F0 0%, #FCEFD9 55%, #F7E6C8 100%)' }}
    >
      <div className="relative mx-auto max-w-[1100px]">
        {showRangeForm ? (
            <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
              <div className="text-[13.5px] font-extrabold tracking-wide text-gold-deep">암송집중데이</div>
              <div className="mt-2.5 text-balance text-[38px] font-extrabold leading-[1.15] text-navy-deep sm:text-[46px]">성경구절쌓기</div>
              <div className="mt-4 text-[15px] font-semibold text-text-muted">오늘 쌓을 구절은?</div>
              <div className="mt-6 flex items-center justify-center gap-2.5">
                <input
                  type="number"
                  min={1}
                  max={48}
                  value={startVerse}
                  onChange={(e) => setStartVerse(Number(e.target.value))}
                  className="w-[68px] border-b-[2.5px] border-navy/[0.18] bg-transparent text-center text-[20px] font-extrabold text-navy-deep outline-none focus:border-gold-deep"
                />
                <span className="text-[20px] font-extrabold text-navy-deep">절 ~</span>
                <input
                  type="number"
                  min={1}
                  max={48}
                  value={endVerse}
                  onChange={(e) => setEndVerse(Number(e.target.value))}
                  className="w-[68px] border-b-[2.5px] border-navy/[0.18] bg-transparent text-center text-[20px] font-extrabold text-navy-deep outline-none focus:border-gold-deep"
                />
                <span className="text-[20px] font-extrabold text-navy-deep">절</span>
              </div>
              <button
                onClick={() => setPendingAction('open')}
                className="mt-7 rounded-full bg-navy-deep px-14 py-4 text-[16px] font-extrabold text-cream shadow-[0_10px_26px_rgba(31,43,64,0.28)]"
              >
                시작
              </button>
              {isOpen && (
                <button onClick={() => setEditingRange(false)} className="mt-4 text-[12.5px] font-bold text-text-muted">
                  취소하고 말판으로 돌아가기
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2.5">
                <div>
                  <div className="text-[27px] font-extrabold text-navy-deep">
                    <span className="text-gold-deep">암송집중데이</span> — {round!.startVerse}~{round!.endVerse}절
                  </div>
                  <div className="mt-1.5 text-[12.5px] text-text-muted">정답을 맞힐 때마다 즉시 전진해요</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={startEditingRange}
                    className="rounded-[10px] bg-navy-deep px-4 py-2.5 text-[12px] font-extrabold text-cream"
                  >
                    다른 범위로 다시 열기
                  </button>
                  <button
                    onClick={() => setPendingAction('close')}
                    className="rounded-[10px] bg-navy/[0.08] px-4 py-2.5 text-[12px] font-extrabold text-navy"
                  >
                    종료
                  </button>
                </div>
              </div>

              <EventBoardTrack rows={Object.values(rows)} length={length} />

              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full bg-navy/[0.06] px-3.5 py-1.5 text-[11.5px] font-bold text-navy">
                  {Object.keys(rows).length}명 참여 중
                </span>
                <span className="rounded-full bg-navy/[0.06] px-3.5 py-1.5 text-[11.5px] font-bold text-navy">출발선(0) → {length}절 완주</span>
              </div>
            </>
          )}
      </div>

      {pendingAction === 'open' && (
        <EventTeacherActionModal
          title="라운드를 열려면 교사 확인이 필요해요"
          description={`이름과 PIN을 입력하면 확인 후 ${startVerse}~${endVerse}절 범위로 새 라운드가 열려요. 참여 중이던 모든 기록은 초기화됩니다.`}
          confirmLabel="확인하고 열기"
          run={() => openEventRound(startVerse, endVerse)}
          onClose={() => setPendingAction(null)}
          onSuccess={() => {
            setPendingAction(null)
            setEditingRange(false)
          }}
        />
      )}
      {pendingAction === 'close' && (
        <EventTeacherActionModal
          title="라운드를 종료할까요?"
          description="이름과 PIN을 입력하면 확인 후 라운드가 종료돼요. 참여 중이던 모든 기록이 초기화되고, 참여자 화면은 대기 상태로 돌아가요."
          confirmLabel="확인하고 종료"
          run={closeEventRound}
          onClose={() => setPendingAction(null)}
          onSuccess={() => {
            setPendingAction(null)
            setEditingRange(false)
          }}
        />
      )}
    </div>
  )
}
