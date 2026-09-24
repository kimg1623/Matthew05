import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { fetchEventRound, subscribeToEventRound, type EventRound } from '@/lib/eventRound'
import { ensureOwnProgressRow, fetchOwnPosition, leaveEventProgress } from '@/lib/eventProgress'
import EventWaitingRoom from '@/components/event/EventWaitingRoom'
import EventModeSelect, { type EventMode } from '@/components/event/EventModeSelect'
import EventStackAllMode from '@/components/event/EventStackAllMode'
import EventStackOneMode from '@/components/event/EventStackOneMode'
import EventStackPile from '@/components/event/EventStackPile'

function range(start: number, end: number): number[] {
  const out: number[] = []
  for (let v = start; v <= end; v++) out.push(v)
  return out
}

export default function Event() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [round, setRound] = useState<EventRound | null>(null)
  const [position, setPosition] = useState(0)
  const [mode, setMode] = useState<EventMode | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchEventRound().then((r) => {
      if (active) {
        setRound(r)
        setLoading(false)
      }
    })
    const unsubscribe = subscribeToEventRound((r) => {
      if (active) setRound(r)
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const roundKey = round?.isOpen ? round.updatedAt : null

  useEffect(() => {
    if (!user) return
    if (!roundKey) {
      // 라운드가 종료되면(또는 아직 안 열렸으면) 이전 라운드의 모드/쌓은 개수가 대기 화면에 남지 않게 비운다.
      setMode(null)
      setPosition(0)
      return
    }
    let active = true
    setMode(null)
    // 행을 새로 만들지는 않는다 — "모드 선택" 화면에 있는 동안은 공유화면 말판에 안 보여야 하고,
    // 말판에는 실제로 모드를 고른 사람만(handleSelectMode에서) 올라간다. 기존 행이 있으면
    // (새로고침 등으로 재진입) 그 위치만 읽어와 이어서 보여준다.
    fetchOwnPosition(user.id).then((pos) => {
      if (active) setPosition(pos)
    })
    return () => {
      active = false
    }
    // roundKey가 바뀔 때(새 라운드가 열릴 때)마다 모드 선택을 초기화하고 본인 위치를 재확인한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, roundKey])

  async function handleSelectMode(m: EventMode) {
    if (user) {
      const pos = await ensureOwnProgressRow(user.id)
      setPosition(pos)
    }
    setMode(m)
  }

  async function handleBack() {
    if (user) await leaveEventProgress(user.id)
    setPosition(0)
    setMode(null)
  }

  async function handleLeave() {
    if (user) await leaveEventProgress(user.id)
    navigate('/')
  }

  const verseNumbers = round?.isOpen && round.startVerse && round.endVerse ? range(round.startVerse, round.endVerse) : []

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-cream pb-10">
      <div className="relative bg-navy-deep px-6 pb-8 pt-9">
        <button onClick={handleLeave} className="flex items-center gap-1 text-[12.5px] font-bold text-cream/60">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          돌아가기
        </button>
        <div className="mt-3 text-[12.5px] font-bold text-gold">암송집중데이</div>
        <div className="mt-2 text-[26px] font-extrabold leading-tight text-cream">성경구절쌓기</div>
        <div className="mt-3.5 h-[3px] w-10 rounded bg-gold" />
        <EventStackPile count={position} />
      </div>

      <div className="px-4 pb-8 pt-5">
        {loading && <div className="py-16 text-center text-sm text-text-muted">불러오는 중...</div>}
        {!loading && !round?.isOpen && <EventWaitingRoom />}
        {!loading && round?.isOpen && !mode && <EventModeSelect onSelect={handleSelectMode} />}
        {!loading &&
          round?.isOpen &&
          mode === 'all' && (
            <EventStackAllMode verseNumbers={verseNumbers} initialPosition={position} onProgress={setPosition} onBack={handleBack} />
          )}
        {!loading &&
          round?.isOpen &&
          mode === 'one' && (
            <EventStackOneMode verseNumbers={verseNumbers} initialPosition={position} onProgress={setPosition} onBack={handleBack} />
          )}
      </div>
    </div>
  )
}
