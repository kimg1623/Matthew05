import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { weeks } from '@/lib/data'
import { MODE_LABEL, TEST_MODES, type TestMode } from '@/lib/testModes'

const MODE_DESC: Record<TestMode, string> = {
  order: '단어 카드를 순서에 맞게 배치하세요',
  cloze: '문장 속 빈칸에 알맞은 단어를 입력하세요',
  blur: '첫 어절만 보고 나머지를 떠올려보세요',
}

const MODE_STYLE: Record<TestMode, { bg: string; stroke: string; icon: JSX.Element }> = {
  order: {
    bg: 'bg-gold/[0.15]',
    stroke: '#E08E3E',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#E08E3E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="3" y="7" width="7" height="7" rx="1.5" />
        <rect x="14" y="7" width="7" height="7" rx="1.5" />
        <path d="M7 14v3M17 14v3" />
      </svg>
    ),
  },
  cloze: {
    bg: 'bg-teal/[0.15]',
    stroke: '#457B6E',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#457B6E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M4 7h16M4 12h6M14 12h6M4 17h10" />
      </svg>
    ),
  },
  blur: {
    bg: 'bg-coral/[0.15]',
    stroke: '#E76F51',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="#E76F51" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
        <circle cx="12" cy="12" r="2.6" />
      </svg>
    ),
  },
}

export default function Test() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<TestMode | null>(null)
  const [chapterN, setChapterN] = useState(1)

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-cream pb-24">
      <div className="bg-navy-deep px-6 pb-10 pt-9">
        <div className="text-[12.5px] font-bold text-gold">마태복음 5장</div>
        <div className="mt-2 text-[26px] font-extrabold leading-tight text-cream">테스트</div>
        <div className="mt-3.5 h-[3px] w-10 rounded bg-gold" />
        <div className="mt-3.5 text-[13px] text-cream/65">원하는 학습 방식을 먼저 고르고, 챕터를 선택하세요</div>
      </div>

      <div className="flex flex-col gap-3.5 px-4 pt-5">
        {TEST_MODES.map((m) => {
          const style = MODE_STYLE[m]
          return (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={
                'flex items-center gap-3.5 rounded-[20px] border-[1.5px] bg-white p-4 text-left ' +
                (mode === m ? 'border-gold' : 'border-navy/[0.08]')
              }
            >
              <div className={'flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl ' + style.bg}>
                {style.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15.5px] font-extrabold text-navy">{MODE_LABEL[m]}</div>
                <div className="mt-[3px] text-[12.5px] leading-snug text-text-muted">{MODE_DESC[m]}</div>
              </div>
            </button>
          )
        })}
      </div>

      {mode && (
        <div className="px-4 pt-2">
          <div className="mb-2.5 mt-4 text-[12.5px] font-bold text-text-muted">챕터를 선택하세요</div>
          <div className="grid grid-cols-4 gap-2.5">
            {weeks.map((week) => (
              <button
                key={week.n}
                onClick={() => setChapterN(week.n)}
                className={
                  'flex aspect-square flex-col items-center justify-center gap-0.5 rounded-2xl border-[1.5px] font-extrabold ' +
                  (chapterN === week.n
                    ? 'border-gold bg-gold text-navy-deep'
                    : 'border-navy/[0.08] bg-white text-navy')
                }
              >
                <span className="text-[15px]">{week.n}</span>
                <span className={'text-[9.5px] font-semibold ' + (chapterN === week.n ? 'text-navy-deep/65' : 'text-text-muted')}>
                  챕터
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate(`/chapter/${chapterN}/test/${mode}`)}
            className="mt-4 w-full rounded-2xl bg-navy-deep p-3.5 text-center text-[15px] font-bold text-cream"
          >
            {chapterN}챕터 · {MODE_LABEL[mode]} 시작하기 →
          </button>
        </div>
      )}
    </div>
  )
}
