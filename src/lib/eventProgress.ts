import { supabase } from '@/lib/supabase'

// 학생이 이벤트 화면에 처음 들어올 때(또는 모드를 고를 때) 본인 행을 0으로 보장한다.
// 이미 있으면 그대로 현재 위치를 돌려준다 — 새로고침해도 진행 상황이 유지되는 이유.
export async function ensureOwnProgressRow(userId: string): Promise<number> {
  const { data } = await supabase.from('event_progress').select('position').eq('user_id', userId).maybeSingle()
  if (data) return data.position

  const { data: inserted } = await supabase
    .from('event_progress')
    .insert({ user_id: userId, position: 0 })
    .select('position')
    .maybeSingle()
  if (inserted) return inserted.position

  // 동시 최초 진입(StrictMode 등) 대비 재조회
  const { data: retry } = await supabase.from('event_progress').select('position').eq('user_id', userId).maybeSingle()
  return retry?.position ?? 0
}

export async function fetchOwnPosition(userId: string): Promise<number> {
  const { data } = await supabase.from('event_progress').select('position').eq('user_id', userId).maybeSingle()
  return data?.position ?? 0
}

// 정답 시 "현재 위치+1"만 허용하는 RPC. 더블탭 등으로 기대 position이 어긋나면
// null이 돌아오는데, 이미 정상적으로 전진한 상태를 뒤늦게 다시 시도한 것뿐이므로
// 호출부는 이를 에러로 취급하지 않고 실시간 구독이 가져다주는 값으로 맞추면 된다.
export async function incrementEventProgress(expectedPosition: number): Promise<number | null> {
  const { data } = await supabase.rpc('increment_event_progress', { p_expected_position: expectedPosition })
  return (data as number | null) ?? null
}

// "모드 선택으로 돌아가기" 또는 참여화면 나가기 — 본인 행을 아예 지워서
// 공유화면 말판에서도 사라지게 한다. 모드를 다시 고르면 ensureOwnProgressRow가
// 0에서 새로 만들어준다.
export async function leaveEventProgress(userId: string): Promise<void> {
  await supabase.from('event_progress').delete().eq('user_id', userId)
}

export function subscribeToOwnProgress(userId: string, onChange: (position: number) => void) {
  const channel = supabase
    .channel(`event-progress-self-${userId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'event_progress', filter: `user_id=eq.${userId}` },
      (payload) => onChange((payload.new as { position: number }).position),
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

export type EventBoardRow = { userId: string; name: string; position: number }

// event_board는 이름까지 안전하게 노출하는 anon 공개 뷰다(event_progress 직접
// 조회로는 profiles가 anon에게 안 열려있어 이름을 못 가져온다).
export async function fetchEventBoard(): Promise<EventBoardRow[]> {
  const { data } = await supabase.from('event_board').select('user_id, position, name')
  return (data ?? []).map((r) => ({ userId: r.user_id, position: r.position, name: r.name ?? '?' }))
}

// 교사 보드 구독: UPDATE/INSERT는 position 갱신, DELETE는 목록에서 제거
// (DELETE 페이로드의 old에는 기본적으로 PK만 담기므로 position을 신뢰하면 안 된다).
export function subscribeToEventBoard(
  onUpsert: (row: { userId: string; position: number }) => void,
  onRemove: (userId: string) => void,
) {
  const channel = supabase
    .channel('event-progress-board')
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'event_progress' }, (payload) => {
      const old = payload.old as { user_id: string } | null
      if (old) onRemove(old.user_id)
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'event_progress' }, (payload) => {
      if (payload.eventType === 'DELETE') return
      const row = payload.new as { user_id: string; position: number }
      onUpsert({ userId: row.user_id, position: row.position })
    })
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}
