import { Link } from 'react-router-dom'
import { weeks } from '@/lib/data'
import ChapterCard from '@/components/ChapterCard'

export default function Home() {
  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-cream">
      <div className="bg-navy-deep px-6 pb-10 pt-9">
        <div className="text-[12.5px] font-bold text-gold">마태복음 5장</div>
        <div className="mt-2 text-[26px] font-extrabold leading-tight text-cream">전체 암송 챌린지</div>
        <div className="mt-3.5 h-[3px] w-10 rounded bg-gold" />
        <div className="mt-3.5 text-[13px] text-cream/65">8챕터, 48절 — WING 청소년부 함께 완주해요</div>
      </div>

      <div className="flex flex-col gap-3.5 px-4 pb-8 pt-5">
        {weeks.map((week) => (
          <Link key={week.n} to={`/chapter/${week.n}`}>
            <ChapterCard week={week} />
          </Link>
        ))}

        <Link to="/chapter/all" className="mt-1.5 flex items-center gap-3.5 rounded-[20px] bg-navy-deep p-4">
          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-gold/[0.18]">
            <svg viewBox="0 0 24 24" fill="none" stroke="#F4A259" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-[26px] w-[26px]">
              <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11a2 2 0 0 1 2 2v14a1.5 1.5 0 0 0-1.5-1.5H4Z" />
              <path d="M20 5.5C20 4.7 19.3 4 18.5 4H13a2 2 0 0 0-2 2v14a1.5 1.5 0 0 1 1.5-1.5H20Z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[15.5px] font-extrabold text-cream">마태복음 5장 전체</div>
            <div className="mt-1 text-xs text-cream/60">48절 한 번에 이어서 보기</div>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-cream/50">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
