import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

type HeaderProps = {
  title: string
  subtitle?: string
  children?: ReactNode
}

export default function Header({ title, subtitle, children }: HeaderProps) {
  const navigate = useNavigate()
  return (
    <div className="bg-navy-deep px-5 pb-6 pt-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-white/10"
          aria-label="뒤로가기"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <div className="text-[17px] font-bold text-white">{title}</div>
      </div>
      {subtitle && <div className="ml-[46px] mt-2.5 text-[13px] text-white/70">{subtitle}</div>}
      {children}
    </div>
  )
}
