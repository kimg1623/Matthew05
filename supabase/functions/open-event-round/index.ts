// 교사가 "암송집중데이" 공유화면(/focus-share)에서 시작절~끝절을 입력하고 "시작"을 누르면
// 호출되는 관리자 함수. event_progress에는 UPDATE 정책 자체가 없고(전진은
// increment_event_progress RPC로만), event_round도 쓰기 정책이 없으므로 라운드를
// 여는 것(=참가자 전원 리셋 + 새 범위 지정)은 여기 service role로만 가능하다.
//
// 배포: npx supabase functions deploy open-event-round --project-ref <프로젝트-ref>
// SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY는 Supabase가 자동으로 주입한다.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const startVerse = Number(body?.startVerse)
    const endVerse = Number(body?.endVerse)

    if (
      !Number.isInteger(startVerse) ||
      !Number.isInteger(endVerse) ||
      startVerse < 1 ||
      endVerse > 48 ||
      startVerse > endVerse
    ) {
      return json({ ok: false, error: '절 범위를 다시 확인해주세요.' })
    }

    // 이후 작업은 RLS를 우회하는 service role로 수행 (호출자 검증은 이미 끝남)
    const admin = createClient(supabaseUrl, serviceRoleKey)

    const { error: roundError } = await admin
      .from('event_round')
      .update({ is_open: true, start_verse: startVerse, end_verse: endVerse, updated_at: new Date().toISOString() })
      .eq('id', true)

    if (roundError) {
      return json({ ok: false, error: '라운드를 여는 중 오류가 발생했어요.' })
    }

    // 새 라운드는 곧 전체 리셋 — 이전 참가자 기록을 모두 지운다.
    const { error: deleteError } = await admin.from('event_progress').delete().not('user_id', 'is', null)
    if (deleteError) {
      return json({ ok: false, error: '참가자 기록을 초기화하는 중 오류가 발생했어요.' })
    }

    return json({ ok: true, startVerse, endVerse })
  } catch {
    return json({ ok: false, error: '서버 오류가 발생했어요.' }, 500)
  }
})
