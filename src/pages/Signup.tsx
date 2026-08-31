import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { GRADES, useAuth, type Grade } from '@/lib/auth'

export default function Signup() {
  const { user, profile, loading, signUp } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [grade, setGrade] = useState<Grade>(GRADES[0])
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // signUp() 내부에서 "이미 가입된 계정인지" 확인하려고 잠깐 로그인했다가 다시 signOut하는 구간이 있다.
  // 그 찰나에 세션이 잡히는 순간 이 리다이렉트가 먼저 반응해서 홈으로 튕기고, 뒤늦게 signOut이
  // 반영되며 다시 밀려나는 레이스가 있었다 — submitting 중에는 이 리다이렉트를 쉬게 한다.
  if (!submitting && !loading && user && profile) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const cleanName = name.trim()
    if (!cleanName) {
      setError('이름을 입력해주세요.')
      return
    }
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN은 숫자 4자리로 입력해주세요.')
      return
    }
    if (pin !== pinConfirm) {
      setError('PIN이 서로 일치하지 않아요.')
      return
    }

    setSubmitting(true)
    const result = await signUp(cleanName, grade, pin)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.message)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col justify-center bg-cream px-6 py-10">
      <div className="text-center">
        <div className="text-[12.5px] font-bold text-gold-deep">마태복음 5장</div>
        <div className="mt-2 text-2xl font-extrabold text-navy">회원가입</div>
        <div className="mt-2 text-[13px] text-text-muted">이름, 학년, PIN을 정해서 가입하세요.</div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">이름</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="실명을 입력하세요"
            className="w-full rounded-[10px] border-[1.5px] border-gold/50 bg-white px-3.5 py-2.5 text-[15px] font-bold text-navy outline-none placeholder:font-normal placeholder:text-text-muted/75"
          />
        </div>

        <div>
          <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">구분</div>
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
        </div>

        <div>
          <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">PIN (숫자 4자리)</div>
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            inputMode="numeric"
            type="password"
            maxLength={4}
            placeholder="••••"
            className="w-full rounded-[10px] border-[1.5px] border-gold/50 bg-white px-3.5 py-2.5 text-center text-[18px] font-bold tracking-[0.4em] text-navy outline-none placeholder:font-normal placeholder:text-text-muted/75"
          />
        </div>

        <div>
          <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">PIN 확인</div>
          <input
            value={pinConfirm}
            onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
            inputMode="numeric"
            type="password"
            maxLength={4}
            placeholder="••••"
            className="w-full rounded-[10px] border-[1.5px] border-gold/50 bg-white px-3.5 py-2.5 text-center text-[18px] font-bold tracking-[0.4em] text-navy outline-none placeholder:font-normal placeholder:text-text-muted/75"
          />
        </div>

        {error && (
          <div className="rounded-xl bg-coral/10 px-3.5 py-2.5 text-[13px] font-semibold text-coral">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-2xl bg-navy-deep p-3.5 text-center text-[15px] font-bold text-cream disabled:opacity-50"
        >
          {submitting ? '확인 중...' : '가입하기'}
        </button>
      </form>

      <div className="mt-5 text-center text-[13px] text-text-muted">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="font-bold text-gold-deep">
          로그인
        </Link>
      </div>
    </div>
  )
}
