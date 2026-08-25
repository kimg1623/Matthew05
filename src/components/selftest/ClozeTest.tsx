import { useEffect, useMemo, useState } from 'react'
import { clozeBlanks, getVerseText } from '@/lib/data'
import { iconUrlForVerse } from '@/lib/icons'
import { measureTextWidth } from '@/lib/measureText'
import type { SelfTestProps } from './types'

const BLANK_MIN_WIDTH = 62
const BLANK_HORIZONTAL_PADDING = 20

type VerseBlanks = { parts: string[]; phrases: string[] } | null

type BlankAnswer = {
  value: string
  checked: boolean
  correct: boolean
  revealed: boolean
}

function buildVerseBlanks(text: string, phrases: string[] | undefined): VerseBlanks {
  if (!phrases || phrases.length === 0) return null
  const parts: string[] = []
  let rest = text
  for (const phrase of phrases) {
    const idx = rest.indexOf(phrase)
    if (idx === -1) return null
    parts.push(rest.slice(0, idx))
    rest = rest.slice(idx + phrase.length)
  }
  parts.push(rest)
  return { parts, phrases }
}

function answerKey(v: number, i: number) {
  return `${v}:${i}`
}

export default function ClozeTest({ chapterN, verseNumbers, onProgress, onFinish }: SelfTestProps) {
  const blanksByVerse = useMemo(() => {
    const map: Record<number, VerseBlanks> = {}
    for (const v of verseNumbers) {
      map[v] = buildVerseBlanks(getVerseText(v), clozeBlanks[String(v)])
    }
    return map
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verseNumbers])

  const gradableVerses = verseNumbers.filter((v) => blanksByVerse[v] !== null)

  const [answers, setAnswers] = useState<Record<string, BlankAnswer>>({})

  function isVerseChecked(v: number) {
    const blanks = blanksByVerse[v]
    if (!blanks) return true
    return blanks.phrases.every((_, i) => answers[answerKey(v, i)]?.checked)
  }

  function isVerseCorrect(v: number) {
    const blanks = blanksByVerse[v]
    if (!blanks) return false
    return blanks.phrases.every((_, i) => answers[answerKey(v, i)]?.correct)
  }

  const checkedCount = gradableVerses.filter(isVerseChecked).length
  const correctCount = gradableVerses.filter(isVerseCorrect).length

  useEffect(() => {
    onProgress(checkedCount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedCount])

  function updateValue(v: number, i: number, value: string) {
    const key = answerKey(v, i)
    setAnswers((prev) => ({ ...prev, [key]: { value, checked: false, correct: false, revealed: false } }))
  }

  function checkBlank(v: number, i: number) {
    const blanks = blanksByVerse[v]
    if (!blanks) return
    const key = answerKey(v, i)
    setAnswers((prev) => {
      const current = prev[key] ?? { value: '', checked: false, correct: false, revealed: false }
      if (!current.value.trim()) return prev
      return { ...prev, [key]: { ...current, checked: true, correct: current.value.trim() === blanks.phrases[i] } }
    })
  }

  function revealBlank(v: number, i: number) {
    const key = answerKey(v, i)
    setAnswers((prev) => {
      const current = prev[key] ?? { value: '', checked: true, correct: false, revealed: false }
      return { ...prev, [key]: { ...current, revealed: true } }
    })
  }

  const allChecked = gradableVerses.length === 0 || gradableVerses.every(isVerseChecked)

  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      {verseNumbers.map((v) => {
        const blanks = blanksByVerse[v]
        const verseChecked = isVerseChecked(v)
        const verseCorrect = isVerseCorrect(v)
        return (
          <div
            key={v}
            className={
              'rounded-2xl border bg-white p-3.5 px-4 ' +
              (blanks && verseChecked ? (verseCorrect ? 'border-teal/40' : 'border-coral/50') : 'border-navy/[0.08]')
            }
          >
            <div className="flex items-start gap-3">
              <img src={iconUrlForVerse(v, chapterN)} alt="" className="h-9 w-9 shrink-0" />
              <div className="flex-1">
                <span className="text-[11.5px] font-bold text-gold-deep">{v}절</span>
                {blanks ? (
                  <div className="mt-1 text-[14.5px] leading-[1.9] text-navy">
                    {blanks.parts.map((part, i) => (
                      <span key={i}>
                        {part}
                        {i < blanks.phrases.length && (
                          <ClozeBlankInput
                            phrase={blanks.phrases[i]}
                            answer={answers[answerKey(v, i)]}
                            onChange={(value) => updateValue(v, i, value)}
                            onCheck={() => checkBlank(v, i)}
                            onReveal={() => revealBlank(v, i)}
                          />
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="mt-1 text-[14.5px] leading-relaxed text-navy">{getVerseText(v)}</div>
                )}
              </div>
            </div>
          </div>
        )
      })}

      <button
        onClick={() => onFinish({ correct: correctCount, total: gradableVerses.length, gradable: gradableVerses.length > 0 })}
        disabled={!allChecked}
        className="mt-2 rounded-2xl bg-navy-deep p-3.5 text-center text-[15px] font-bold text-cream disabled:opacity-40"
      >
        {allChecked ? '테스트 완료' : '모든 빈칸을 입력해주세요'}
      </button>
    </div>
  )
}

function ClozeBlankInput({
  phrase,
  answer,
  onChange,
  onCheck,
  onReveal,
}: {
  phrase: string
  answer: BlankAnswer | undefined
  onChange: (value: string) => void
  onCheck: () => void
  onReveal: () => void
}) {
  const checked = answer?.checked ?? false
  const correct = answer?.correct ?? false
  const value = answer?.value ?? ''
  const width = Math.max(BLANK_MIN_WIDTH, measureTextWidth(value) + BLANK_HORIZONTAL_PADDING)

  return (
    <span className="inline-flex items-center gap-1.5">
      <input
        value={answer?.value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCheck}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onCheck()
            ;(e.target as HTMLInputElement).blur()
          }
        }}
        disabled={checked && correct}
        placeholder="빈칸"
        style={{ width: `${width}px` }}
        className={
          'mx-1 inline-block rounded-md border px-1.5 py-0.5 text-center text-sm font-bold outline-none ' +
          (checked
            ? correct
              ? 'border-teal bg-teal/10 text-teal-deep'
              : 'border-coral bg-coral/10 text-coral'
            : 'border-dashed border-gold-deep bg-cream')
        }
      />
      {checked && !correct && !answer?.revealed && (
        <button
          type="button"
          onClick={onReveal}
          className="rounded-full bg-navy/[0.06] px-2 py-0.5 text-[10.5px] font-semibold text-text-muted"
        >
          정답보기
        </button>
      )}
      {checked && !correct && answer?.revealed && (
        <span className="text-xs font-semibold text-coral">정답: {phrase}</span>
      )}
    </span>
  )
}
