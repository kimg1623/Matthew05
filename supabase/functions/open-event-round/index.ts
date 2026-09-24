// "암송집중데이" 공유화면(/focus-racing, /focus-card)에서 시작절~끝절을 입력하고 "시작"을 누르면
// 호출되는 함수. event_progress에는 UPDATE 정책 자체가 없고(전진은 increment_event_progress
// RPC로만), event_round도 쓰기 정책이 없으므로 라운드를 여는 것(=참가자 전원 리셋 + 새 범위 지정)은
// 여기 service role로만 가능하다.
//
// ⚠️ 공유화면은 로그인 없이 쓰는 화면이라 이 함수도 호출자 인증을 하지 않는다 —
//    공유화면 주소를 아는 사람은 누구나 라운드를 열고 닫을 수 있다는 뜻이다(의도된 선택).
//
// 배포: npx supabase functions deploy open-event-round --project-ref <프로젝트-ref>
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY는 Supabase가 자동으로 주입한다.

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

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

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
