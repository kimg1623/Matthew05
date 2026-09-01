import { useState } from 'react'
import { Link } from 'react-router-dom'
import { weeks } from '@/lib/data'
import ChapterCard from '@/components/ChapterCard'
import BiblePictureGallery from '@/components/BiblePictureGallery'

export default function Home() {
  const [galleryOpen, setGalleryOpen] = useState(false)

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-cream pb-24">
      <div className="bg-navy-deep px-6 pb-10 pt-9">
        <div className="text-[12.5px] font-bold text-gold">마태복음 5장</div>
        <div className="mt-2 text-[26px] font-extrabold leading-tight text-cream">전체 암송 챌린지</div>
        <div className="mt-3.5 h-[3px] w-10 rounded bg-gold" />
        <div className="mt-3.5 text-[13px] text-cream/65">8챕터, 48절 — WING 청소년부 함께 완주해요</div>

        <div className="relative mt-4 inline-block">
          <button
            onClick={() => setGalleryOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-gold/[0.35] bg-gold/[0.14] py-2.5 pl-3 pr-3.5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#F4A259" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
              <rect x="2.5" y="5.5" width="14" height="14" rx="2.2" />
              <circle cx="7.2" cy="10.2" r="1.3" />
              <path d="M4.5 16.5l3.8-3.8a1.6 1.6 0 0 1 2.2 0l3.5 3.5" />
              <path d="M9 5.5V4.8a1.8 1.8 0 0 1 1.8-1.8h9.4A1.8 1.8 0 0 1 22 4.8v9.4a1.8 1.8 0 0 1-1.8 1.8h-0.7" />
            </svg>
            <span className="text-[13.5px] font-bold text-gold">그림으로 성경읽기</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="#F4A259" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" className="h-[15px] w-[15px]">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <span className="absolute -right-2 -top-2 rounded-full bg-coral px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-white shadow-[0_1px_3px_rgba(15,20,30,0.35)]">
            NEW
          </span>
        </div>
      </div>

      {galleryOpen && <BiblePictureGallery startIndex={0} onClose={() => setGalleryOpen(false)} />}

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
