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

async function deriveEmail(name: string): Promise<string> {
  const bytes = new TextEncoder().encode(normalizeName(name))
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
  logIn: (name: string, pin: string) => Promise<LoginResult>
  signUp: (name: string, grade: Grade, pin: string) => Promise<LoginResult>
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

  // signUp 직후 profiles insert가 실패해 세션은 있지만 프로필이 없는 "고아 계정"이 될 수 있다
  // (과거 버그, 혹은 드문 네트워크 오류). signIn 경로에서도 이 상태를 복구할 수 있어야
  // 해당 계정이 영구히 로그인 불가 상태로 고정되지 않는다 — 그래서 두 경로가 이 함수를 공유한다.
  async function createProfile(userId: string, name: string, grade: Grade): Promise<LoginResult> {
    const { error: insertError } = await supabase.from('profiles').insert({ id: userId, name, grade })
    if (insertError) {
      await supabase.auth.signOut()
      if (insertError.code === '23505') {
        return {
          ok: false,
          message: '이미 같은 이름으로 등록된 사람이 있어요. 동명이인이면 이름 뒤에 숫자를 붙여 다시 등록해주세요 (예: 홍길동2).',
        }
      }
      return { ok: false, message: '가입 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.' }
    }
    setProfile({ id: userId, name, grade })
    return { ok: true }
  }

  async function logIn(name: string, pin: string): Promise<LoginResult> {
    const cleanName = normalizeName(name)
    const email = await deriveEmail(cleanName)
    const password = derivePassword(pin)

    const { data } = await supabase.auth.signInWithPassword({ email, password })
    if (!data.session) {
      return { ok: false, message: '이름 또는 PIN을 다시 확인해주세요. 계정이 없다면 회원가입해주세요.' }
    }

    const userId = data.session.user.id
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, name, grade')
      .eq('id', userId)
      .maybeSingle()
    if (!existingProfile) {
      // 학년 정보가 없어 이 경로에서는 프로필을 복구할 수 없다 — 회원가입 화면(학년 포함)에서
      // 다시 진행하면 signUp()의 self-heal 경로가 복구해준다.
      return {
        ok: false,
        message: '계정 정보가 아직 완전하지 않아요. 회원가입 화면에서 다시 진행해주세요.',
      }
    }
    setProfile(existingProfile as Profile)
    return { ok: true }
  }

  async function signUp(name: string, grade: Grade, pin: string): Promise<LoginResult> {
    const cleanName = normalizeName(name)
    const email = await deriveEmail(cleanName)
    const password = derivePassword(pin)

    const signInResult = await supabase.auth.signInWithPassword({ email, password })
    if (signInResult.data.session) {
      const userId = signInResult.data.session.user.id
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle()
      if (existingProfile) {
        await supabase.auth.signOut()
        return { ok: false, message: '이미 가입된 이름이에요. 로그인해주세요.' }
      }
      // 계정(이메일/PIN)은 이미 있는데 프로필만 없는 고아 계정 — 지금 입력한 학년으로 복구한다.
      return createProfile(userId, cleanName, grade)
    }

    const signUpResult = await supabase.auth.signUp({ email, password })
    if (signUpResult.data.session) {
      return createProfile(signUpResult.data.session.user.id, cleanName, grade)
    }

    // signIn도 signUp도 실패했는데, 이 이메일이 이미 등록돼 있다는 뜻이면 PIN을 잘못 입력한 것 —
    // 같은 이름의 새 계정처럼 보이지만 실제로는 본인 계정에 PIN이 안 맞는 상황이다.
    if (signUpResult.error?.code === 'user_already_exists') {
      return {
        ok: false,
        message: '이미 있는 회원이에요. 비밀번호(PIN)를 잊어버렸다면 선생님에게 문의해주세요.',
      }
    }

    return { ok: false, message: '가입 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.' }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, profile, loading, logIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
