import { useState } from 'react'
import { chunkVerse } from '@/lib/verseChunks'
import { shuffle } from '@/lib/shuffle'

type Props = {
  verseNumber: number
  onCorrect: () => void
}

// 절 하나를 "청크"(의미 단위로 묶은 어절 뭉치) 단위로 배치하는 문제.
// WordOrderTest.tsx의 슬롯/뱅크 탭-배치 상호작용을 그대로 가져오되, 단어 대신
// chunkVerse()로 만든 청크 문자열을 카드로 쓴다. 한 절만 담당하고 부모가
// key={verseNumber}로 다음 절마다 새로 마운트한다.
export default function EventChunkOrderQuestion({ verseNumber, onCorrect }: Props) {
  const [chunks] = useState(() => chunkVerse(verseNumber))
  const [slots, setSlots] = useState<(string | null)[]>(() => chunks.map(() => null))
  const [bank, setBank] = useState<string[]>(() => shuffle(chunks))
  const [wrong, setWrong] = useState(false)
  const [solved, setSolved] = useState(false)

  function placeFromBank(bankIdx: number) {
    const emptySlot = slots.indexOf(null)
    if (emptySlot === -1) return
    const chunk = bank[bankIdx]
    setBank(bank.filter((_, i) => i !== bankIdx))
    setSlots(slots.map((s, i) => (i === emptySlot ? chunk : s)))
    setWrong(false)
  }

  function removeFromSlot(slotIdx: number) {
    const chunk = slots[slotIdx]
    if (!chunk) return
    setSlots(slots.map((s, i) => (i === slotIdx ? null : s)))
    setBank([...bank, chunk])
  }

  function check() {
    const ok = slots.every((c, i) => c === chunks[i])
    if (ok) {
      setSolved(true)
      onCorrect()
    } else {
      setWrong(true)
    }
  }

  const allFilled = slots.every((s) => s !== null)

  return (
    <div className="mt-3 rounded-xl bg-cream p-2.5">
      <div className="flex min-h-[40px] flex-wrap gap-1.5">
        {slots.map((chunk, i) =>
          chunk ? (
            <button
              key={i}
              onClick={() => removeFromSlot(i)}
              disabled={solved}
              className="rounded-[9px] bg-navy-deep px-2.5 py-1.5 text-[13px] font-bold text-white"
            >
              {chunk}
            </button>
          ) : (
            <div key={i} className="h-[34px] min-w-[56px] flex-1 rounded-[9px] border-[1.5px] border-dashed border-gold-deep" />
          ),
        )}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {bank.map((chunk, i) => (
          <button
            key={i}
            onClick={() => placeFromBank(i)}
            className="rounded-[9px] bg-cream-dark px-3 py-2 text-[13px] font-bold text-navy shadow-[0_2px_4px_rgba(31,43,64,0.08)]"
          >
            {chunk}
          </button>
        ))}
      </div>
      <div className="mt-2 min-h-[16px] text-center text-[12.5px] font-bold">
        {solved && <span className="text-teal-deep">정확해요! 쌓는 중...</span>}
        {wrong && !solved && <span className="text-coral">순서가 아직 맞지 않아요.</span>}
      </div>
      {!solved && (
        <button
          onClick={check}
          disabled={!allFilled}
          className="mt-2 w-full rounded-[10px] bg-gold-deep py-2.5 text-center text-[12.5px] font-bold text-white disabled:opacity-30"
        >
          정답 확인하기
        </button>
      )}
    </div>
  )
}
