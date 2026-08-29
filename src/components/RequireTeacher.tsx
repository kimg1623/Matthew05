import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'

export default function RequireTeacher({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-text-muted">
        불러오는 중...
      </div>
    )
  }

  if (profile?.grade !== '교사') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
