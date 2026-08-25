import { useReducer, useRef, useState } from 'react'
import { getVerseText } from '@/lib/data'
import { shuffle } from '@/lib/shuffle'
import type { SelfTestProps } from './types'

type VerseState = {
  words: string[]
  slots: (string | null)[]
  bank: string[]
}

function buildVerseState(text: string): VerseState {
  const words = text.split(' ')
  return { words, slots: words.map(() => null), bank: shuffle(words) }
}

export default function WordOrderTest({ verseNumbers, onProgress, onFinish }: SelfTestProps) {
  const [index, setIndex] = useState(0)
  const cacheRef = useRef<Record<number, VerseState>>({})
  const [, forceRender] = useReducer((c: number) => c + 1, 0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [firstTryCorrect, setFirstTryCorrect] = useState<Set<number>>(new Set())
  const [attempted, setAttempted] = useState<Set<number>>(new Set())
  const [lastResult, setLastResult] = useState<'correct' | 'wrong' | null>(null)

  const currentVerse = verseNumbers[index]

  if (!cacheRef.current[currentVerse]) {
    cacheRef.current[currentVerse] = buildVerseState(getVerseText(currentVerse))
  }
  const state = cacheRef.current[currentVerse]

  function updateState(next: VerseState) {
    cacheRef.current[currentVerse] = next
    setLastResult(null)
    forceRender()
  }

  function placeFromBank(bankIdx: number) {
    const current = cacheRef.current[currentVerse]
    const emptySlot = current.slots.findIndex((s) => s === null)
    if (emptySlot === -1) return
    const word = current.bank[bankIdx]
    const nextBank = current.bank.filter((_, i) => i !== bankIdx)
    const nextSlots = [...current.slots]
    nextSlots[emptySlot] = word
    updateState({ ...current, slots: nextSlots, bank: nextBank })
  }

  function removeFromSlot(slotIdx: number) {
    const current = cacheRef.current[currentVerse]
    const word = current.slots[slotIdx]
    if (word === null) return
    const nextSlots = [...current.slots]
    nextSlots[slotIdx] = null
    updateState({ ...current, slots: nextSlots, bank: [...current.bank, word] })
  }

  function check() {
    const current = cacheRef.current[currentVerse]
    const isCorrect = current.slots.every((w, i) => w === current.words[i])
    if (!attempted.has(currentVerse)) {
      setAttempted((prev) => new Set(prev).add(currentVerse))
      if (isCorrect) setFirstTryCorrect((prev) => new Set(prev).add(currentVerse))
    }
    if (isCorrect) {
      const nextCompleted = new Set(completed).add(currentVerse)
      setCompleted(nextCompleted)
      onProgress(nextCompleted.size)
    }
    setLastResult(isCorrect ? 'correct' : 'wrong')
  }

  function goNext() {
    if (index < verseNumbers.length - 1) {
      setIndex((i) => i + 1)
      setLastResult(null)
    } else {
      onFinish({ correct: firstTryCorrect.size, total: verseNumbers.length, gradable: true })
    }
  }

  function goPrev() {
    if (index > 0) {
      setIndex((i) => i - 1)
      setLastResult(null)
    }
  }

  const isVerseCorrect = completed.has(currentVerse)

  return (
    <div className="px-4 pb-6 pt-6">
      <div className="flex items-center justify-center">
        <span className="inline-block rounded-full bg-gold/[0.15] px-3.5 py-1 text-[13px] font-bold text-gold-deep">
          {currentVerse}절
        </span>
      </div>
      <div className="mt-2.5 text-center text-[12.5px] leading-snug text-text-muted">
        아래 단어 카드를 순서에 맞게 배치하세요
      </div>

      <div className="mt-4 rounded-[18px] bg-white p-4 shadow-[0_2px_10px_rgba(31,43,64,0.08)]">
        <div className="flex flex-wrap gap-2">
          {state.slots.map((word, i) =>
            word ? (
              <button
                key={i}
                onClick={() => removeFromSlot(i)}
                className="rounded-[10px] bg-navy-deep px-3.5 py-2 text-sm font-bold text-white"
              >
                {word}
              </button>
            ) : (
              <div key={i} className="h-[38px] w-14 rounded-[10px] border-[1.5px] border-dashed border-gold-deep" />
            ),
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2.5 text-xs font-semibold text-text-muted">단어 카드</div>
        <div className="flex flex-wrap gap-2.5">
          {state.bank.map((word, i) => (
            <button
              key={i}
              onClick={() => placeFromBank(i)}
              className="rounded-[10px] bg-cream-dark px-4 py-2.5 text-sm font-bold text-navy shadow-[0_2px_4px_rgba(31,43,64,0.08)]"
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {lastResult === 'wrong' && (
        <div className="mt-4 text-center text-[13px] font-semibold text-coral">순서가 아직 맞지 않아요. 다시 시도해보세요.</div>
      )}
      {lastResult === 'correct' && (
        <div className="mt-4 text-center text-[13px] font-semibold text-teal-deep">정확해요!</div>
      )}

      <div className="mt-6 flex gap-2.5">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="flex-1 rounded-2xl border-[1.5px] border-navy/15 py-3.5 text-center text-sm font-bold text-navy disabled:opacity-30"
        >
          ← 이전 절
        </button>
        {isVerseCorrect ? (
          <button onClick={goNext} className="flex-1 rounded-2xl bg-gold py-3.5 text-center text-sm font-extrabold text-navy-deep">
            {index < verseNumbers.length - 1 ? '다음 절 →' : '테스트 완료'}
          </button>
        ) : (
          <button
            onClick={check}
            disabled={state.slots.some((w) => w === null)}
            className="flex-1 rounded-2xl bg-navy-deep py-3.5 text-center text-sm font-bold text-cream disabled:opacity-40"
          >
            정답 확인하기
          </button>
        )}
      </div>
    </div>
  )
}
