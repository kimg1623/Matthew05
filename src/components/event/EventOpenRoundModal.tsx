import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { openEventRound } from '@/lib/eventRound'

type Props = {
  startVerse: number
  endVerse: number
  onClose: () => void
  onSuccess: () => void
}

// "시작" 클릭 시 뜨는 이름+PIN 로그인 폼. 로그인 성공 시 open-event-round를 호출하고,
// 결과와 무관하게 즉시 로그아웃해서 공유 PC에 로그인 상태가 남지 않게 한다.
export default function EventOpenRoundModal({ startVerse, endVerse, onClose, onSuccess }: Props) {
  const { logIn, signOut } = useAuth()
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    if (!name.trim() || pin.length !== 4) {
      setError('이름과 PIN 4자리를 입력해주세요.')
      return
    }
    setSubmitting(true)
    setError('')

    const loginResult = await logIn(name, pin)
    if (!loginResult.ok) {
      setSubmitting(false)
      setError(loginResult.message)
      return
    }

    const openResult = await openEventRound(startVerse, endVerse)
    await signOut()
    setSubmitting(false)

    if (!openResult.ok) {
      setError(openResult.message)
      return
    }
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-navy-deep/40 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-[420px] rounded-t-[24px] bg-cream p-5 pb-7 sm:rounded-[24px]" onClick={(e) => e.stopPropagation()}>
        <div className="text-[16.5px] font-extrabold text-navy">라운드를 열려면 교사 확인이 필요해요</div>
        <div className="mt-2 text-[13px] leading-relaxed text-text-muted">
          이름과 PIN을 입력하면 확인 후 {startVerse}~{endVerse}절 범위로 새 라운드가 열려요. 참여 중이던 모든 기록은 초기화됩니다.
        </div>

        <div className="mt-3.5 flex flex-col gap-2.5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            className="rounded-xl border-[1.5px] border-navy/[0.12] bg-white px-3.5 py-2.5 text-[14px] outline-none"
          />
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            type="password"
            inputMode="numeric"
            maxLength={4}
            placeholder="PIN 4자리"
            className="rounded-xl border-[1.5px] border-navy/[0.12] bg-white px-3.5 py-2.5 text-[14px] outline-none"
          />
        </div>
        {error && <div className="mt-2 text-left text-[12.5px] font-bold text-coral">{error}</div>}

        <div className="mt-4.5 flex gap-2.5">
          <button onClick={onClose} className="flex-1 rounded-2xl bg-white py-3.5 text-center text-[13.5px] font-bold text-navy shadow-[0_2px_8px_rgba(31,43,64,0.1)]">
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 rounded-2xl bg-coral py-3.5 text-center text-[13.5px] font-bold text-white disabled:opacity-50"
          >
            {submitting ? '확인 중...' : '확인하고 열기'}
          </button>
        </div>
      </div>
    </div>
  )
}
