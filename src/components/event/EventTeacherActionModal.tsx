import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import type { RoundActionResult } from '@/lib/eventRound'

type Props = {
  title: string
  description: string
  confirmLabel: string
  run: () => Promise<RoundActionResult>
  onClose: () => void
  onSuccess: () => void
}

// 공유화면에서 교사만 할 수 있는 동작(라운드 시작/종료)을 확인하는 이름+PIN 로그인 폼.
// 로그인 성공 시 run()을 실행하고, 결과와 무관하게 즉시 로그아웃해서
// 공유 PC에 로그인 상태가 남지 않게 한다.
export default function EventTeacherActionModal({ title, description, confirmLabel, run, onClose, onSuccess }: Props) {
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

    const result = await run()
    await signOut()
    setSubmitting(false)

    if (!result.ok) {
      setError(result.message)
      return
    }
    onSuccess()
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-navy-deep/40 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-[420px] rounded-t-[24px] bg-cream p-5 pb-7 sm:rounded-[24px]" onClick={(e) => e.stopPropagation()}>
        <div className="text-[16.5px] font-extrabold text-navy">{title}</div>
        <div className="mt-2 text-[13px] leading-relaxed text-text-muted">{description}</div>

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
            {submitting ? '확인 중...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
