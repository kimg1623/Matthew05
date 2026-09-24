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

// 한 절씩 구절 쌓기: 아코디언 카드. 맨 앞의 미완료 절만 "테스트" 버튼이 활성화된다.
// 누르면 원문이 블러되고 문제가 열리며, 블러된 원문을 다시 누르면 취소(재도전 시 처음부터).
export default function EventStackOneMode({ verseNumbers, initialPosition, onProgress, onBack }: Props) {
  const [index, setIndex] = useState(initialPosition)
  const [testing, setTesting] = useState(false)
  const [testKey, setTestKey] = useState(0)
  const [showBackConfirm, setShowBackConfirm] = useState(false)
  const [flying, setFlying] = useState(false)

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

  const currentVerse = verseNumbers[index]

  function handleCorrect() {
    setFlying(true)
    incrementEventProgress(index).then((next) => {
      setTimeout(() => {
        setFlying(false)
        setTesting(false)
        const newIndex = next ?? index + 1
        setIndex(newIndex)
        onProgress(newIndex)
      }, 480)
    })
  }

  return (
    <div>
      {backButton}
      <div className="flex flex-col gap-2.5">
        <div
          className={
            'origin-[85%_15%] overflow-hidden rounded-2xl bg-white p-3.5 shadow-[0_3px_10px_rgba(31,43,64,0.06)] transition-all duration-500 ' +
            (flying ? 'pointer-events-none m-0 max-h-0 scale-[0.15] rotate-6 translate-x-32 -translate-y-32 py-0 opacity-0' : 'max-h-[600px]')
          }
        >
          <span className="rounded-full bg-gold/[0.14] px-2.5 py-0.5 text-[11px] font-extrabold text-gold-deep">{currentVerse}절</span>

          <div className="relative mt-2" onClick={() => testing && setTesting(false)}>
            <div className={'text-[14.5px] leading-relaxed text-navy ' + (testing ? 'cursor-pointer select-none blur-sm opacity-55' : '')}>
              {getVerseText(currentVerse)}
            </div>
            {testing && (
              <div className="pointer-events-none absolute inset-0 top-2 flex items-center justify-center text-center text-[13px] text-text-muted">
                구절 다시 보기
              </div>
            )}
          </div>

          {testing ? (
            <EventChunkOrderQuestion key={testKey} verseNumber={currentVerse} onCorrect={handleCorrect} />
          ) : (
            <button
              onClick={() => {
                setTestKey((k) => k + 1) // key를 바꿔 매번 처음부터 새로 시작하게 강제 리마운트
                setTesting(true)
              }}
              className="mt-3 w-full rounded-xl bg-navy-deep py-2.5 text-center text-[13px] font-bold text-cream"
            >
              테스트
            </button>
          )}
        </div>

        {verseNumbers.slice(index + 1).map((v) => (
          <div key={v} className="rounded-2xl bg-white p-3.5 opacity-45 shadow-[0_3px_10px_rgba(31,43,64,0.06)]">
            <span className="rounded-full bg-gold/[0.14] px-2.5 py-0.5 text-[11px] font-extrabold text-gold-deep">{v}절</span>
            <div className="mt-2 flex items-center gap-1.5 text-[12px] text-text-muted">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7A7A7A" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
              이전 절부터 순서대로 진행해요
            </div>
          </div>
        ))}
      </div>
      {showBackConfirm && <EventBackConfirmModal onCancel={() => setShowBackConfirm(false)} onConfirm={onBack} />}
    </div>
  )
}
