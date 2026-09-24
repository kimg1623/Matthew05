// "암송집중데이" 공유화면에서 "종료"를 누르면 호출되는 함수.
// event_round와 event_progress에는 클라이언트용 쓰기 정책이 없으므로(전진은 RPC로만),
// 라운드를 닫고 참가자 기록을 비우는 일은 여기 service role로만 가능하다.
// 라운드가 닫히면 참여화면(/focus)은 실시간으로 "대기" 화면으로 돌아간다.
//
// ⚠️ 공유화면은 로그인 없이 쓰는 화면이라 이 함수도 호출자 인증을 하지 않는다 —
//    공유화면 주소를 아는 사람은 누구나 라운드를 열고 닫을 수 있다는 뜻이다(의도된 선택).
//
// 배포: npx supabase functions deploy close-event-round --project-ref <프로젝트-ref>
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
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    const { error: roundError } = await admin
      .from('event_round')
      .update({ is_open: false, start_verse: null, end_verse: null, updated_at: new Date().toISOString() })
      .eq('id', true)

    if (roundError) {
      return json({ ok: false, error: '라운드를 종료하는 중 오류가 발생했어요.' })
    }

    const { error: deleteError } = await admin.from('event_progress').delete().not('user_id', 'is', null)
    if (deleteError) {
      return json({ ok: false, error: '참가자 기록을 초기화하는 중 오류가 발생했어요.' })
    }

    return json({ ok: true })
  } catch {
    return json({ ok: false, error: '서버 오류가 발생했어요.' }, 500)
  }
})
