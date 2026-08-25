import { useEffect, useState } from 'react'
import { getVerseText } from '@/lib/data'
import { iconUrlForVerse } from '@/lib/icons'
import type { SelfTestProps } from './types'

export default function BlurTest({ chapterN, verseNumbers, onProgress, onFinish }: SelfTestProps) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set())

  useEffect(() => {
    onProgress(revealed.size)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed])

  function toggle(v: number) {
    setRevealed((prev) => {
      const next = new Set(prev)
      if (next.has(v)) next.delete(v)
      else next.add(v)
      return next
    })
  }

  const allRevealed = revealed.size === verseNumbers.length

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {verseNumbers.map((v) => {
        const text = getVerseText(v)
        const [first, ...rest] = text.split(' ')
        const restText = rest.join(' ')
        const isRevealed = revealed.has(v)
        return (
          <button
            key={v}
            onClick={() => toggle(v)}
            className={
              'relative flex items-start gap-3 rounded-2xl border bg-white p-3.5 px-4 text-left ' +
              (isRevealed ? 'border-gold/40' : 'border-navy/[0.08]')
            }
          >
            <img src={iconUrlForVerse(v, chapterN)} alt="" className="h-9 w-9 shrink-0" />
            <div className="flex-1">
              <span className="text-[11.5px] font-bold" style={{ color: isRevealed ? '#E08E3E' : '#7A7A7A' }}>
                {v}절
              </span>
              <div className="mt-1 text-[14.5px] leading-relaxed text-navy">
                <span className="font-bold">{first}</span>
                {restText && <span className={isRevealed ? '' : 'select-none blur-sm opacity-50'}> {restText}</span>}
              </div>
              {!isRevealed && <div className="mt-1.5 flex justify-end text-[11px] text-text-muted/80">탭하여 확인</div>}
            </div>
            {isRevealed && (
              <div className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                  <path d="M5 12l5 5 9-9" />
                </svg>
              </div>
            )}
          </button>
        )
      })}

      <button
        onClick={() => onFinish({ correct: revealed.size, total: verseNumbers.length, gradable: false })}
        disabled={!allRevealed}
        className="mt-2 rounded-2xl bg-navy-deep p-3.5 text-center text-[15px] font-bold text-cream disabled:opacity-40"
      >
        {allRevealed ? '테스트 완료' : `${verseNumbers.length - revealed.size}개 절이 남았어요`}
      </button>
    </div>
  )
}
