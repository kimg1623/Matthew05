// 교사가 리더보드에서 학생 이름을 고치거나 PIN을 재설정할 때 호출되는 관리자 함수.
// service role 키가 필요해서 브라우저에서 직접 할 수 없는 두 가지를 대신 처리한다:
//   1) auth.users의 email/password를 직접 변경 (일반 클라이언트는 본인 계정만 가능)
//   2) 호출자가 실제로 교사인지 서버 쪽에서 검증
//
// 이름이 바뀌면 로그인용 이메일(이름의 해시)도 같이 바뀌어야 한다 — profiles.name만 바꾸면
// 기존 계정의 로그인 이메일과 어긋나서 그 학생은 다음 로그인 때 새 계정으로 취급되어 기록이 끊긴다.
// 학년은 더 이상 식별자가 아니므로 학년만 바뀌는 경우는 이메일을 건드리지 않는다.
//
// 배포: npx supabase functions deploy admin-update-student --project-ref <프로젝트-ref>
// SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY는 Supabase가 자동으로 주입한다.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// src/lib/auth.tsx의 PIN_PAD와 반드시 동일해야 한다.
const PIN_PAD = 'mt5pad'

// src/lib/auth.tsx의 GRADES와 반드시 동일해야 한다.
const GRADES = ['중1', '중2', '중3', '고1', '고2', '고3', '교사']

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

function normalizeName(raw: string): string {
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ ok: false, error: '로그인이 필요해요.' })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // 호출자 본인 권한으로 동작하는 클라이언트 — "진짜 교사가 맞는지" 확인용
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: userData, error: userError } = await callerClient.auth.getUser()
    if (userError || !userData.user) {
      return json({ ok: false, error: '로그인이 필요해요.' })
    }

    const { data: callerProfile } = await callerClient
      .from('profiles')
      .select('grade')
      .eq('id', userData.user.id)
      .maybeSingle()

    if (callerProfile?.grade !== '교사') {
      return json({ ok: false, error: '교사만 사용할 수 있어요.' })
    }

    const body = await req.json().catch(() => null)
    const targetUserId = body?.targetUserId as string | undefined
    const newNameRaw = body?.newName as string | undefined
    const newGrade = body?.newGrade as string | undefined
    const newPin = body?.newPin as string | undefined

    if (!targetUserId) return json({ ok: false, error: '대상 학생 정보가 없어요.' })
    if (newPin && !/^\d{4}$/.test(newPin)) return json({ ok: false, error: 'PIN은 숫자 4자리여야 해요.' })
    if (newGrade && !GRADES.includes(newGrade)) return json({ ok: false, error: '올바르지 않은 구분이에요.' })
    if (!newNameRaw && !newGrade && !newPin) return json({ ok: false, error: '변경할 내용이 없어요.' })

    // 이후 작업은 RLS를 우회하는 service role로 수행 (호출자 검증은 이미 끝남)
    const admin = createClient(supabaseUrl, serviceRoleKey)

    const { data: targetProfile, error: targetError } = await admin
      .from('profiles')
      .select('name, grade')
      .eq('id', targetUserId)
      .maybeSingle()

    if (targetError || !targetProfile) {
      return json({ ok: false, error: '대상 학생을 찾을 수 없어요.' })
    }

    const finalName = newNameRaw ? normalizeName(newNameRaw) : targetProfile.name
    const finalGrade = newGrade ?? targetProfile.grade
    const nameChanged = finalName !== targetProfile.name

    if (nameChanged) {
      // updateUserById가 이메일 중복 시 돌려주는 에러는 특정 문구 없이 그냥 "Error updating user"라
      // 나중에 메시지로 판별할 수 없다 — 미리 조회해서 안내 메시지를 확실하게 낸다.
      const { data: nameTaken } = await admin
        .from('profiles')
        .select('id')
        .eq('name', finalName)
        .neq('id', targetUserId)
        .maybeSingle()
      if (nameTaken) {
        return json({ ok: false, error: '이미 같은 이름이 있어요. 동명이인이면 이름 뒤에 숫자를 붙여주세요.' })
      }
    }

    const authUpdates: { email?: string; password?: string } = {}

    if (nameChanged) {
      authUpdates.email = await deriveEmail(finalName)
    }
    if (newPin) {
      authUpdates.password = `${newPin}${PIN_PAD}`
    }

    if (Object.keys(authUpdates).length > 0) {
      const { error: authUpdateError } = await admin.auth.admin.updateUserById(targetUserId, authUpdates)
      if (authUpdateError) {
        return json({ ok: false, error: '계정 정보 변경에 실패했어요.' })
      }
    }

    if (nameChanged || finalGrade !== targetProfile.grade) {
      const { error: profileUpdateError } = await admin
        .from('profiles')
        .update({ name: finalName, grade: finalGrade })
        .eq('id', targetUserId)
      if (profileUpdateError) {
        return json({ ok: false, error: '정보 저장에 실패했어요.' })
      }
    }

    return json({ ok: true, name: finalName, grade: finalGrade })
  } catch {
    return json({ ok: false, error: '서버 오류가 발생했어요.' }, 500)
  }
})
