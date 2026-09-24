import { useState, type ReactNode } from 'react'
import { closeEventRound, openEventRound, type EventRound } from '@/lib/eventRound'
import EventConfirmModal from '@/components/event/EventConfirmModal'

type Props = {
  round: EventRound | null
  isOpen: boolean
  subtitle: string
  children: ReactNode
}

// 공유화면(레이싱/카드 공용) 뼈대: 라운드가 닫혀 있으면 절 범위 입력 + 시작,
// 열려 있으면 제목/다른 범위로 다시 열기/종료 헤더 아래에 각 화면의 본문(children)을 보여준다.
export default function EventShareFrame({ round, isOpen, subtitle, children }: Props) {
  const [startVerse, setStartVerse] = useState(1)
  const [endVerse, setEndVerse] = useState(20)
  const [confirming, setConfirming] = useState<'open' | 'close' | null>(null)
  const [editingRange, setEditingRange] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const showRangeForm = !isOpen || editingRange

  function startEditingRange() {
    if (round?.startVerse) setStartVerse(round.startVerse)
    if (round?.endVerse) setEndVerse(round.endVerse)
    setError('')
    setEditingRange(true)
  }

  async function runAction(action: 'open' | 'close') {
    setConfirming(null)
    setBusy(true)
    setError('')
    const result = action === 'open' ? await openEventRound(startVerse, endVerse) : await closeEventRound()
    setBusy(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setEditingRange(false)
  }

  // 이미 열린 라운드가 있으면 새로 열 때 전원의 기록이 지워지므로 한 번 더 묻는다.
  function handleStart() {
    if (isOpen) setConfirming('open')
    else runAction('open')
  }

  const errorBox = error && (
    <div className="mb-4 rounded-xl bg-coral/10 px-4 py-2.5 text-center text-[13px] font-bold text-coral">{error}</div>
  )

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
            <div className="mt-5 min-h-[44px]">{errorBox}</div>
            <button
              onClick={handleStart}
              disabled={busy}
              className="rounded-full bg-navy-deep px-14 py-4 text-[16px] font-extrabold text-cream shadow-[0_10px_26px_rgba(31,43,64,0.28)] disabled:opacity-50"
            >
              {busy ? '여는 중...' : '시작'}
            </button>
            {isOpen && (
              <button onClick={() => setEditingRange(false)} className="mt-4 text-[12.5px] font-bold text-text-muted">
                취소하고 돌아가기
              </button>
            )}
          </div>
        ) : (
          <>
            {errorBox}
            <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2.5">
              <div>
                <div className="text-[27px] font-extrabold text-navy-deep">
                  <span className="text-gold-deep">암송집중데이</span> — {round!.startVerse}~{round!.endVerse}절
                </div>
                <div className="mt-1.5 text-[12.5px] text-text-muted">{subtitle}</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={startEditingRange}
                  className="rounded-[10px] bg-navy-deep px-4 py-2.5 text-[12px] font-extrabold text-cream"
                >
                  다른 범위로 다시 열기
                </button>
                <button
                  onClick={() => setConfirming('close')}
                  disabled={busy}
                  className="rounded-[10px] bg-navy/[0.08] px-4 py-2.5 text-[12px] font-extrabold text-navy disabled:opacity-50"
                >
                  {busy ? '종료 중...' : '종료'}
                </button>
              </div>
            </div>
            {children}
          </>
        )}
      </div>

      {confirming === 'open' && (
        <EventConfirmModal
          title="새 범위로 다시 열까요?"
          description={`${startVerse}~${endVerse}절 범위로 새 라운드가 열려요. 참여 중이던 모든 기록은 초기화됩니다.`}
          confirmLabel="다시 열기"
          onCancel={() => setConfirming(null)}
          onConfirm={() => runAction('open')}
        />
      )}
      {confirming === 'close' && (
        <EventConfirmModal
          title="라운드를 종료할까요?"
          description="참여 중이던 모든 기록이 초기화되고, 참여자 화면은 대기 상태로 돌아가요."
          confirmLabel="종료"
          onCancel={() => setConfirming(null)}
          onConfirm={() => runAction('close')}
        />
      )}
    </div>
  )
}
