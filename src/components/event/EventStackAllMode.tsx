import { useState } from 'react'
import { getVerseText } from '@/lib/data'
import { incrementEventProgress } from '@/lib/eventProgress'
import EventChunkOrderQuestion from '@/components/event/EventChunkOrderQuestion'
import EventBackConfirmModal from '@/components/event/EventBackConfirmModal'

type Props = {
  verseNumbers: number[]
  initialPosition: number
  onProgress: (position: number) => void
  onBack: () => void
}

// 한 번에 구절 쌓기: 범위의 모든 절을 먼저 쭉 보여주고, "테스트 시작"을 누르면
// 이어서 순서대로 청크 배치 문제를 푼다. 정답을 맞힌 절은 목록에서 사라지며
// 쌓인다(더미로 "날아가는" 느낌은 EventStackPile 카운트 증가로 표현).
export default function EventStackAllMode({ verseNumbers, initialPosition, onProgress, onBack }: Props) {
  const [index, setIndex] = useState(initialPosition)
  const [started, setStarted] = useState(initialPosition > 0)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [flying, setFlying] = useState(false)

  function handleCorrect() {
    setFlying(true)
    incrementEventProgress(index).then((next) => {
      setTimeout(() => {
        setFlying(false)
        const newIndex = next ?? index + 1
        setIndex(newIndex)
        onProgress(newIndex)
      }, 480)
    })
  }

  const backButton = (
    <button onClick={() => setShowBackConfirm(true)} className="mb-3.5 flex items-center gap-1 text-[12.5px] font-bold text-text-muted">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      모드 선택으로 돌아가기
    </button>
  )

  if (index >= verseNumbers.length) {
    // 끝까지 쌓은 뒤에는 "모드 선택으로 돌아가기"를 없애서 완료 상태가 실수로 초기화되지 않게 한다.
    return (
      <div className="py-14 text-center">
        <div className="text-[17px] font-extrabold text-navy">🎉 다 쌓았어요!</div>
        <div className="mt-2 text-[12.5px] text-text-muted">공유 화면에서 내 말이 얼마나 전진했는지 확인해보세요.</div>
      </div>
    )
  }

  if (!started) {
    return (
      <div>
        {backButton}
        <div className="flex flex-col gap-2.5">
          {verseNumbers.map((v) => (
            <div key={v} className="rounded-2xl bg-white p-3.5 shadow-[0_3px_10px_rgba(31,43,64,0.06)]">
              <span className="rounded-full bg-gold/[0.14] px-2.5 py-0.5 text-[11px] font-extrabold text-gold-deep">{v}절</span>
              <div className="mt-2 text-[14.5px] leading-relaxed text-navy">{getVerseText(v)}</div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setStarted(true)}
          className="mt-3.5 w-full rounded-2xl bg-gold py-3.5 text-center text-[14px] font-extrabold text-navy-deep"
        >
          테스트 시작
        </button>
        {showBackConfirm && <EventBackConfirmModal onCancel={() => setShowBackConfirm(false)} onConfirm={onBack} />}
      </div>
    )
  }

  return (
    <div>
      {backButton}
      <div className="flex flex-col gap-2.5">
        {verseNumbers.slice(index).map((v, i) => (
          <div
            key={v}
            className={
              'origin-[85%_15%] overflow-hidden rounded-2xl bg-white p-3.5 shadow-[0_3px_10px_rgba(31,43,64,0.06)] transition-all duration-500 ' +
              (i === 0 && flying
                ? 'pointer-events-none m-0 max-h-0 scale-[0.15] rotate-6 translate-x-32 -translate-y-32 py-0 opacity-0'
                : 'max-h-[400px]') +
              (i > 0 ? ' opacity-45' : '')
            }
          >
            <span className="rounded-full bg-gold/[0.14] px-2.5 py-0.5 text-[11px] font-extrabold text-gold-deep">{v}절</span>
            {i === 0 ? (
              <EventChunkOrderQuestion key={v} verseNumber={v} onCorrect={handleCorrect} />
            ) : (
              // 아직 오지 않은 절은 본문을 보여주지 않고 잠금 카드로만 표시한다(정답 힌트가 되지 않도록).
              <div className="mt-2 flex items-center gap-1.5 text-[12px] text-text-muted">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7A7A7A" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
                이전 절부터 순서대로 진행해요
              </div>
            )}
          </div>
        ))}
      </div>
      {showBackConfirm && <EventBackConfirmModal onCancel={() => setShowBackConfirm(false)} onConfirm={onBack} />}
    </div>
  )
}
