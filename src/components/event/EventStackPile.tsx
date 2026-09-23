import { useEffect, useState } from 'react'

// 화면 우측 상단에 고정된 "쌓인 더미" 배지 — 쌓인 개수가 늘 때마다 살짝 튀는 효과.
export default function EventStackPile({ count }: { count: number }) {
  const [bump, setBump] = useState(false)

  useEffect(() => {
    if (count === 0) return
    setBump(true)
    const t = setTimeout(() => setBump(false), 300)
    return () => clearTimeout(t)
  }, [count])

  if (count === 0) return null

  return (
    <div
      className={
        'absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/[0.18] px-2.5 py-1.5 transition-transform duration-300 ' +
        (bump ? 'scale-125' : 'scale-100')
      }
    >
      <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
        <rect y="0" width="14" height="3" rx="1.5" fill="#F4A259" />
        <rect y="4" width="14" height="3" rx="1.5" fill="#F4A259" />
        <rect y="8" width="14" height="3" rx="1.5" fill="#F4A259" />
      </svg>
      <span className="text-[12px] font-extrabold text-gold">{count}</span>
    </div>
  )
}
