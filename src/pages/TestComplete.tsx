import { useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { getWeek } from '@/lib/data'
import { useAuth } from '@/lib/auth'
import Header from '@/components/Header'
import ChapterCard from '@/components/ChapterCard'
import ToggleSwitch from '@/components/ToggleSwitch'
import { MODE_LABEL, type TestMode } from '@/lib/testModes'

type LocationState = {
  chapterN: number
  mode: TestMode
  correct: number
  total: number
  gradable: boolean
}

function formatToday(): string {
  const d = new Date()
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default function TestComplete() {
  const { n, mode } = useParams()
  const location = useLocation()
  const state = location.state as LocationState | null

  const chapterN = state?.chapterN ?? Number(n)
  const testMode = (state?.mode ?? mode) as TestMode
  const week = getWeek(chapterN)
  const { profile } = useAuth()

  const [showAccuracy, setShowAccuracy] = useState(true)

  if (!week) return <Navigate to="/" replace />

  const accuracy = state && state.total > 0 ? Math.round((state.correct / state.total) * 100) : null

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-cream">
      <Header title="셀프테스트 완료" />

      <div className="px-5 pb-2 pt-6 text-center">
        <div className="mx-auto h-[52px] w-[52px]">
          <svg viewBox="0 0 240 240" className="h-full w-full">
            <circle cx="120" cy="120" r="112" fill="#F4A259" />
            <circle cx="120" cy="120" r="112" fill="none" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="4" />
            <g transform="translate(45,45) scale(1.5)" fill="none" stroke="#1F2B40" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M50 10 L60 38 L90 38 L65 56 L75 85 L50 66 L25 85 L35 56 L10 38 L40 38 Z" />
            </g>
          </svg>
        </div>
        <div className="mt-3 text-lg font-extrabold text-navy">수고하셨어요!</div>
      </div>

      <div className="mx-5 mt-4 rounded-[22px] border-[1.5px] border-gold/35 bg-white p-6 px-6 pb-7 shadow-[0_6px_20px_rgba(31,43,64,0.1)]">
        <div className="text-center text-[11.5px] font-semibold tracking-wide text-text-muted">
          마태복음 5장 암송 챌린지
        </div>

        <div className="mx-auto mt-4 h-14 w-14">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <circle cx="50" cy="42" r="30" fill="#F4A259" stroke="#1F2B40" strokeWidth="3.5" />
            <path d="M32 62 L24 88 L38 80 L46 92 L54 68" fill="#E08E3E" stroke="#1F2B40" strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M68 62 L76 88 L62 80 L54 92 L46 68" fill="#E08E3E" stroke="#1F2B40" strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M38 42 L46 50 L64 30" fill="none" stroke="#1F2B40" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="mt-[18px]">
          <div className="mb-1.5 text-[11.5px] font-semibold text-text-muted">이름</div>
          <div className="w-full rounded-[10px] border-[1.5px] border-gold/50 bg-cream px-3.5 py-2.5 text-center text-[15px] font-bold text-navy">
            {profile ? `${profile.name} (${profile.grade})` : '-'}
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full bg-gold/[0.12] px-3 py-[7px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#E08E3E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
              <rect x="3" y="5" width="18" height="16" rx="3" />
              <path d="M3 10h18M8 3v4M16 3v4" />
            </svg>
            <span className="text-[11.5px] font-bold text-gold-deep">{formatToday()}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-teal/[0.12] px-3 py-[7px]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#457B6E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            <span className="text-[11.5px] font-bold text-teal-deep">{MODE_LABEL[testMode] ?? testMode}</span>
          </div>
        </div>

        <div className="mt-4">
          <ChapterCard week={week} variant="compact" />
        </div>

        {state?.gradable && accuracy !== null && (
          <>
            <div className="my-[18px] h-px bg-navy/[0.08]" />
            <div className="flex items-center justify-between">
              <div className="text-[11.5px] font-semibold text-text-muted">정답률 공개</div>
              <div className="flex items-center gap-2">
                <span className="text-[10.5px] text-text-muted">{showAccuracy ? '탭하여 숨기기' : '탭하여 공개'}</span>
                <ToggleSwitch on={showAccuracy} onToggle={() => setShowAccuracy((v) => !v)} />
              </div>
            </div>
            <div className="mt-2.5 text-center">
              {showAccuracy ? (
                <>
                  <span className="text-[34px] font-extrabold text-gold-deep">{accuracy}%</span>
                  <span className="text-xs text-text-muted"> 정답</span>
                </>
              ) : (
                <span className="text-[15px] font-bold text-text-muted">비공개</span>
              )}
            </div>
          </>
        )}
      </div>

      <div className="px-8 pt-4 text-center text-xs leading-relaxed text-text-muted">
        이 화면을 캡처해서 완료를 인증해보세요
      </div>

      <div className="px-5 pb-7 pt-4">
        <Link
          to="/"
          className="block rounded-2xl bg-navy-deep p-3.5 text-center text-sm font-bold text-cream"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
