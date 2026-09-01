import { useRef, useState, type CSSProperties, type TouchEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { weeks } from '@/lib/data'
import { accentHexForChapter, coverUrlForChapter } from '@/lib/icons'

type BiblePictureGalleryProps = {
  startIndex?: number
  onClose: () => void
}

export default function BiblePictureGallery({ startIndex = 0, onClose }: BiblePictureGalleryProps) {
  const navigate = useNavigate()
  const [index, setIndex] = useState(startIndex)
  const [rotated, setRotated] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const total = weeks.length
  const week = weeks[index]
  const accentHex = accentHexForChapter(week.n)

  const go = (i: number) => setIndex((i + total) % total)

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }
  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current == null) return
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current
    const dx = endX - touchStartX.current
    touchStartX.current = null
    if (dx > 40) go(index - 1)
    else if (dx < -40) go(index + 1)
  }

  const stageStyle: CSSProperties = rotated
    ? {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '100vh',
        height: '100vw',
        transform: 'translate(-50%, -50%) rotate(90deg)',
        overflow: 'hidden',
      }
    : {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '100vw',
        height: 'calc(100vh - 152px)',
        transform: 'translate(-50%, -50%)',
        overflow: 'hidden',
        borderRadius: 20,
      }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0f141e]/[0.94]" style={{ touchAction: 'pan-y' }}>
      <button
        onClick={onClose}
        aria-label="닫기"
        className="absolute right-4 top-4 z-10 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/[0.14]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <button
        onClick={() => setRotated((r) => !r)}
        aria-label="화면 회전"
        className="absolute right-[60px] top-4 z-10 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/[0.14]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px]">
          <rect x="7" y="3" width="10" height="16" rx="2" />
          <path d="M20 10a8 8 0 1 1-2.6-5.9" />
          <path d="M20 3v4.5h-4.5" />
        </svg>
      </button>

      <div className="absolute left-4 top-[23px] z-10 text-[12.5px] font-bold text-white/55">
        {index + 1} / {total}
      </div>

      <div style={stageStyle} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <img src={coverUrlForChapter(week.n)} alt="" className="absolute inset-0 h-full w-full object-contain" />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/0 via-navy-deep/0 to-navy-deep/[0.85]" />
        <div className="absolute bottom-[18px] left-5 right-5">
          <span
            className="inline-block rounded-full px-3 py-[5px] text-[13px] font-bold text-navy-deep"
            style={{ backgroundColor: accentHex }}
          >
            {week.n}챕터
          </span>
          <div className="mt-2.5 text-[23px] font-extrabold leading-tight text-white">{week.title}</div>
          <div className="mt-1 text-[13px] font-semibold" style={{ color: accentHex }}>
            {week.range}
          </div>
          <button
            onClick={() => {
              onClose()
              navigate(`/chapter/${week.n}`)
            }}
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-[9px]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#1F2B40" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-[15px] w-[15px]">
              <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11a2 2 0 0 1 2 2v14a1.5 1.5 0 0 0-1.5-1.5H4Z" />
              <path d="M20 5.5C20 4.7 19.3 4 18.5 4H13a2 2 0 0 0-2 2v14a1.5 1.5 0 0 1 1.5-1.5H20Z" />
            </svg>
            <span className="text-[13px] font-extrabold text-navy-deep">성경본문읽기</span>
          </button>

          <div className="mt-3.5 flex items-center justify-center gap-1.5">
            {weeks.map((w, i) => (
              <div
                key={w.n}
                onClick={() => setIndex(i)}
                className="h-1.5 shrink-0 cursor-pointer rounded-full transition-[width]"
                style={{ width: i === index ? 18 : 6, backgroundColor: i === index ? '#F4A259' : 'rgba(255,255,255,0.3)' }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => go(index - 1)}
          aria-label="이전 그림"
          className="absolute left-[10px] top-1/2 flex h-[38px] w-[38px] -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.14]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <button
          onClick={() => go(index + 1)}
          aria-label="다음 그림"
          className="absolute right-[10px] top-1/2 flex h-[38px] w-[38px] -translate-y-1/2 items-center justify-center rounded-full bg-white/[0.14]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
