import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { fetchEventRound, subscribeToEventRound, type EventRound } from '@/lib/eventRound'
import { ensureOwnProgressRow, leaveEventProgress, setOwnMode, type EventMode } from '@/lib/eventProgress'
import EventWaitingRoom from '@/components/event/EventWaitingRoom'
import EventModeSelect from '@/components/event/EventModeSelect'
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
  // 본인 행(위치/고른 방식)을 읽어오기 전에는 모드 선택 화면이 잠깐 깜빡이지 않도록 기다린다.
  const [rowReady, setRowReady] = useState(false)

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
      setRowReady(false)
      return
    }
    let active = true
    setRowReady(false)
    // 라운드가 열려 있는 동안 참여화면에 들어오면 본인 행을 만들어 공유화면에 이름이 나타나게 한다.
    // 새로고침으로 재진입한 경우엔 서버에 저장된 위치와 고른 방식을 그대로 복원해 이어서 진행한다.
    ensureOwnProgressRow(user.id).then((own) => {
      if (!active) return
      setPosition(own.position)
      setMode(own.mode)
      setRowReady(true)
    })
    return () => {
      active = false
    }
    // roundKey가 바뀔 때(새 라운드가 열릴 때)마다 본인 행을 다시 확인한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, roundKey])

  async function handleSelectMode(m: EventMode) {
    if (user) await ensureOwnProgressRow(user.id) // 행이 지워졌더라도 다시 만든 뒤 방식을 기록한다
    await setOwnMode(m)
    setMode(m)
  }

  // 모드 선택으로 돌아가기: 접속 상태(이름)는 유지하고 방식/쌓은 개수만 비운다.
  async function handleBack() {
    await setOwnMode(null)
    setPosition(0)
    setMode(null)
  }

  const verseNumbers = round?.isOpen && round.startVerse && round.endVerse ? range(round.startVerse, round.endVerse) : []
  const completed = Boolean(mode) && verseNumbers.length > 0 && position >= verseNumbers.length

  // 나가기: 다 쌓은 참여자는 행을 남겨서 공유화면에 완료 상태(초록 뱃지)가 유지되게 하고,
  // 중간에 나가는 참여자만 행을 지워 공유화면에서도 사라지게 한다.
  async function handleLeave() {
    if (user && !completed) await leaveEventProgress(user.id)
    navigate('/')
  }
  const playing = !loading && Boolean(round?.isOpen) && rowReady

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
        {playing && !mode && <EventModeSelect onSelect={handleSelectMode} />}
        {playing && mode === 'all' && (
          <EventStackAllMode verseNumbers={verseNumbers} initialPosition={position} onProgress={setPosition} onBack={handleBack} />
        )}
        {playing && mode === 'one' && (
          <EventStackOneMode verseNumbers={verseNumbers} initialPosition={position} onProgress={setPosition} onBack={handleBack} />
        )}
      </div>
    </div>
  )
}
