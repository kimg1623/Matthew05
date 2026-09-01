import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { getChapterVerseNumbers, getVerseText, getWeek } from '@/lib/data'
import {
  accentHexForChapter,
  accentNameForChapter,
  accentTextHexForChapter,
  accentTintForChapter,
  coverUrlForChapter,
  groupVersesByIcon,
} from '@/lib/icons'

export default function ChapterDetail() {
  const { n } = useParams()
  const chapterN = Number(n)
  const week = getWeek(chapterN)
  const navigate = useNavigate()
  const [zoomed, setZoomed] = useState(false)

  if (!week) return <Navigate to="/" replace />

  const verseNumbers = getChapterVerseNumbers(week)
  const groups = groupVersesByIcon(verseNumbers)
  const accentName = accentNameForChapter(chapterN)
  const accentHex = accentHexForChapter(chapterN)
  const accentTextHex = accentTextHexForChapter(chapterN)
  const accentTint = accentTintForChapter(chapterN, 0.15)

  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col bg-cream">
      <div className="relative h-[211px] w-full overflow-hidden bg-navy-deep">
        <img src={coverUrlForChapter(chapterN)} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/0 via-navy-deep/10 to-navy-deep/[0.88]" />
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/[0.4]"
          aria-label="뒤로가기"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <button
          onClick={() => setZoomed(true)}
          className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-white/[0.4] py-2 pl-2.5 pr-3"
          aria-label="그림 크게 보기"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <circle cx="11" cy="11" r="7" />
            <path d="M11 8v6M8 11h6" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <span className="text-xs font-bold text-white">그림크게보기</span>
        </button>
        <div className="absolute bottom-4 left-5 right-5">
          <span
            className="inline-block rounded-full px-2.5 py-1 text-xs font-bold text-navy-deep"
            style={{ backgroundColor: accentHex }}
          >
            {chapterN}챕터
          </span>
          <div className="mt-2.5 text-xl font-extrabold leading-tight text-white">{week.title}</div>
          <div className="mt-1 text-[12.5px] font-semibold" style={{ color: accentHex }}>
            {week.range}
          </div>
        </div>
      </div>

      <div className="mx-4 mt-4 flex items-start gap-2.5 rounded-2xl bg-cream-dark p-3.5 px-4">
        <svg viewBox="0 0 24 24" fill="none" stroke="#E08E3E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="mt-px h-5 w-5 shrink-0">
          <path d="M9 18h6" />
          <path d="M10 21h4" />
          <path d="M12 3a6 6 0 0 0-3 11.2c.6.4 1 1.1 1 1.8h4c0-.7.4-1.4 1-1.8A6 6 0 0 0 12 3Z" />
        </svg>
        <div>
          <div className="text-xs font-bold text-gold-deep">암송 팁</div>
          <div className="mt-[3px] text-[13px] leading-snug text-text-dark">{week.tip}</div>
        </div>
      </div>

      <div className="mx-4 mb-6 mt-2 flex flex-1 flex-col gap-[18px]">
        {groups.map((group) => (
          <div key={group.verseNumbers[0]} className="flex items-start gap-3">
            <img src={`/icons/${group.icon}-${accentName}.svg`} alt="" className="h-11 w-11 shrink-0" />
            <div className="flex flex-1 flex-col gap-2 pt-[3px]">
              {group.verseNumbers.map((v) => (
                <div key={v} className="flex gap-2">
                  <span
                    className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{ backgroundColor: accentTint, color: accentTextHex }}
                  >
                    {v}
                  </span>
                  <span className="text-sm leading-relaxed text-text-dark">{getVerseText(v)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 border-t border-navy/[0.08] bg-white p-4 px-5">
        <Link
          to={`/chapter/${chapterN}/test/order`}
          className="block rounded-2xl bg-gold p-3.5 text-center text-[15px] font-extrabold text-navy-deep"
        >
          셀프테스트 시작 →
        </Link>
      </div>

      {zoomed && (
        <div
          onClick={() => setZoomed(false)}
          className="fixed inset-0 z-30 flex items-center justify-center bg-[#0f141e]/[0.94]"
        >
          <button
            onClick={() => setZoomed(false)}
            className="absolute right-4 top-4 z-10 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/[0.14]"
            aria-label="닫기"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-1/2 top-1/2 aspect-[16/9] w-[100vh] max-w-[177.78vw] -translate-x-1/2 -translate-y-1/2 rotate-90 overflow-hidden"
          >
            <img src={coverUrlForChapter(chapterN)} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/0 via-navy-deep/0 to-navy-deep/[0.85]" />
            <div className="absolute bottom-[18px] left-5 right-5">
              <span
                className="inline-block rounded-full px-3 py-[5px] text-[13px] font-bold text-navy-deep"
                style={{ backgroundColor: accentHex }}
              >
                {chapterN}챕터
              </span>
              <div className="mt-2.5 text-[23px] font-extrabold leading-tight text-white">{week.title}</div>
              <div className="mt-1 text-[13px] font-semibold" style={{ color: accentHex }}>
                {week.range}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
