import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export const GRADES = ['중1', '중2', '중3', '고1', '고2', '고3', '교사'] as const
export type Grade = (typeof GRADES)[number]

export type Profile = { id: string; name: string; grade: Grade }

// PIN만으로는 Supabase Auth의 최소 비밀번호 길이(6자)를 만족하지 못해 붙이는 고정 패딩.
// 비밀 값이 아니며 실질 보안은 4자리 PIN 수준 — 내부 청소년부용 앱의 의도된 트레이드오프.
// ⚠️ supabase/functions/admin-update-student/index.ts에 동일한 값이 복제되어 있다 — 바꾸면 같이 바꿀 것.
const PIN_PAD = 'mt5pad'

export function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ').normalize('NFC')
}

async function deriveEmail(name: string, grade: Grade): Promise<string> {
  const input = `${normalizeName(name)}|${grade}`
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return `u${hex.slice(0, 24)}@mt5.internal`
}

function derivePassword(pin: string): string {
  return `${pin}${PIN_PAD}`
}

type LoginResult = { ok: true } | { ok: false; message: string }

type AuthContextValue = {
  user: User | null
  profile: Profile | null
  loading: boolean
  loginOrSignUp: (name: string, grade: Grade, pin: string) => Promise<LoginResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [profileFetchedFor, setProfileFetchedFor] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setSessionLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (!newSession) setProfile(null)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    const userId = session?.user.id
    if (!userId) return
    let active = true
    supabase
      .from('profiles')
      .select('id, name, grade')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return
        if (data) setProfile(data as Profile)
        setProfileFetchedFor(userId)
      })
    return () => {
      active = false
    }
  }, [session?.user.id])

  // 세션은 있는데 그 세션의 프로필을 아직 못 가져온 순간(첫 렌더 포함)도 loading으로 취급해야
  // RequireTeacher 등에서 "프로필이 아직 null이라 교사가 아니다"로 오판하지 않는다.
  const loading = sessionLoading || (Boolean(session) && profileFetchedFor !== session?.user.id)

  async function loginOrSignUp(name: string, grade: Grade, pin: string): Promise<LoginResult> {
    const cleanName = normalizeName(name)
    const email = await deriveEmail(cleanName, grade)
    const password = derivePassword(pin)

    const signInResult = await supabase.auth.signInWithPassword({ email, password })
    if (signInResult.data.session) return { ok: true }

    const signUpResult = await supabase.auth.signUp({ email, password })
    if (signUpResult.data.session) {
      const userId = signUpResult.data.session.user.id
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, name: cleanName, grade })
      if (insertError) {
        return { ok: false, message: '가입 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.' }
      }
      setProfile({ id: userId, name: cleanName, grade })
      return { ok: true }
    }

    return {
      ok: false,
      message: '이름/학년/PIN을 다시 확인해주세요. 동명이인이면 이름 뒤에 숫자를 붙여 다시 등록해주세요 (예: 홍길동2).',
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, profile, loading, loginOrSignUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
