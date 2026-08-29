import { useState } from 'react'
import { updateStudent } from '@/lib/adminActions'
import { GRADES, type Grade } from '@/lib/auth'

type Props = {
  userId: string
  currentName: string
  currentGrade: Grade
  onClose: () => void
  onSaved: (updated: { name: string; grade: Grade }) => void
}

export default function StudentEditModal({ userId, currentName, currentGrade, onClose, onSaved }: Props) {
  const [name, setName] = useState(currentName)
  const [grade, setGrade] = useState<Grade>(currentGrade)
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSave() {
    setError(null)
    const cleanName = name.trim()
    if (!cleanName) {
      setError('이름을 입력해주세요.')
      return
    }
    if (pin && !/^\d{4}$/.test(pin)) {
      setError('PIN은 숫자 4자리로 입력해주세요.')
      return
    }
    const nameChanged = cleanName !== currentName
    const gradeChanged = grade !== currentGrade
    if (!nameChanged && !gradeChanged && !pin) {
      onClose()
      return
    }

    setSubmitting(true)
    const result = await updateStudent(userId, {
      name: nameChanged ? cleanName : undefined,
      grade: gradeChanged ? grade : undefined,
      pin: pin || undefined,
    })
    setSubmitting(false)

    if (!result.ok) {
      setError(result.message)
      return
    }
    onSaved({ name: cleanName, grade })
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-end justify-center bg-navy-deep/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[420px] rounded-t-[24px] bg-cream p-5 pb-7 sm:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 text-[16px] font-extrabold text-navy">학생 정보 수정</div>

        <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">이름</div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-[10px] border-[1.5px] border-gold/50 bg-white px-3.5 py-2.5 text-[15px] font-bold text-navy outline-none"
        />

        <div className="mb-1.5 mt-3.5 text-[11.5px] font-semibold text-text-muted">구분</div>
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value as Grade)}
          className="w-full rounded-[10px] border-[1.5px] border-gold/50 bg-white px-3.5 py-2.5 text-[15px] font-bold text-navy outline-none"
        >
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <div className="mb-1.5 mt-3.5 text-[11.5px] font-semibold text-text-muted">
          새 PIN (변경할 때만 입력, 숫자 4자리)
        </div>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          inputMode="numeric"
          type="password"
          maxLength={4}
          placeholder="••••"
          className="w-full rounded-[10px] border-[1.5px] border-gold/50 bg-white px-3.5 py-2.5 text-center text-[16px] font-bold tracking-[0.4em] text-navy outline-none placeholder:font-normal placeholder:text-text-muted/75"
        />

        {error && (
          <div className="mt-3 rounded-xl bg-coral/10 px-3.5 py-2.5 text-[13px] font-semibold text-coral">
            {error}
          </div>
        )}

        <div className="mt-5 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border-[1.5px] border-navy/15 py-3 text-center text-sm font-bold text-navy"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="flex-1 rounded-2xl bg-navy-deep py-3 text-center text-sm font-bold text-cream disabled:opacity-50"
          >
            {submitting ? '저장 중...' : '저장'}
          </button>
        </div>

        <div className="mt-3 text-center text-[11px] leading-relaxed text-text-muted">
          PIN은 저장된 값을 볼 수 없어 확인은 불가능해요. 학생이 PIN을 잊었을 땐 여기서 새 PIN으로 바꿔주세요.
        </div>
      </div>
    </div>
  )
}
