import { NavLink } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

type NavItem = {
  to: string
  label: string
  icon: (active: boolean) => JSX.Element
}

function stroke(active: boolean) {
  return active ? '#1F2B40' : '#7A7A7A'
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: '성경',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke(active)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M4 5.5C4 4.7 4.7 4 5.5 4H11a2 2 0 0 1 2 2v14a1.5 1.5 0 0 0-1.5-1.5H4Z" />
        <path d="M20 5.5C20 4.7 19.3 4 18.5 4H13a2 2 0 0 0-2 2v14a1.5 1.5 0 0 1 1.5-1.5H20Z" />
      </svg>
    ),
  },
  {
    to: '/test',
    label: '테스트',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke(active)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    ),
  },
  {
    to: '/leaderboard',
    label: '리더보드',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke(active)} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" />
        <path d="M7 6H4a1 1 0 0 0-1 1c0 2.5 1.5 4.5 4 5M17 6h3a1 1 0 0 1 1 1c0 2.5-1.5 4.5-4 5" />
      </svg>
    ),
  },
  {
    to: '/my',
    label: 'MY',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke={stroke(active)} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <circle cx="12" cy="8" r="3.6" />
        <path d="M4.5 20c1.4-3.8 4.4-5.8 7.5-5.8s6.1 2 7.5 5.8" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const { profile } = useAuth()
  const isTeacher = profile?.grade === '교사'
  const items = NAV_ITEMS.filter((item) => item.to !== '/leaderboard' || isTeacher)

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-[480px] border-t border-navy/[0.08] bg-white">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className="flex flex-1 flex-col items-center gap-1 py-2.5"
        >
          {({ isActive }) => (
            <>
              {item.icon(isActive)}
              <span className={'text-[10.5px] font-bold ' + (isActive ? 'text-navy-deep' : 'text-text-muted')}>
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
