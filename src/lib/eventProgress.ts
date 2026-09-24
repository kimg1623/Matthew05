import { supabase } from '@/lib/supabase'

export type EventMode = 'all' | 'one'

export type OwnProgress = { position: number; mode: EventMode | null }

// 학생이 참여화면에 들어오면(라운드가 열려 있는 동안) 본인 행을 만들어 공유화면에 이름이 나타나게 한다.
// 이미 있으면 그대로 돌려준다 — 새로고침해도 위치와 고른 방식이 유지되는 이유.
export async function ensureOwnProgressRow(userId: string): Promise<OwnProgress> {
  const read = () => supabase.from('event_progress').select('position, mode').eq('user_id', userId).maybeSingle()

  const { data } = await read()
  if (data) return { position: data.position, mode: data.mode as EventMode | null }

  const { data: inserted } = await supabase
    .from('event_progress')
    .insert({ user_id: userId, position: 0 })
    .select('position, mode')
    .maybeSingle()
  if (inserted) return { position: inserted.position, mode: inserted.mode as EventMode | null }

  // 동시 최초 진입(StrictMode 등) 대비 재조회
  const { data: retry } = await read()
  return { position: retry?.position ?? 0, mode: (retry?.mode as EventMode | null) ?? null }
}

// 정답 시 "현재 위치+1"만 허용하는 RPC. 더블탭 등으로 기대 position이 어긋나면
// null이 돌아오는데, 이미 정상적으로 전진한 상태를 뒤늦게 다시 시도한 것뿐이므로
// 호출부는 이를 에러로 취급하지 않고 실시간 구독이 가져다주는 값으로 맞추면 된다.
export async function incrementEventProgress(expectedPosition: number): Promise<number | null> {
  const { data } = await supabase.rpc('increment_event_progress', { p_expected_position: expectedPosition })
  return (data as number | null) ?? null
}

// 방식을 고르면 공유화면에 방식 뱃지가 뜬다. null이면 "모드 선택으로 돌아가기" —
// 방식을 비우고 쌓은 개수도 0으로 되돌린다(행은 그대로 남아 접속 상태는 유지).
export async function setOwnMode(mode: EventMode | null): Promise<void> {
  await supabase.rpc('set_own_event_mode', { p_mode: mode })
}

// 참여화면을 중간에 나갈 때 — 본인 행을 아예 지워서 공유화면에서도 사라지게 한다.
// (다 쌓은 뒤 나가는 경우는 호출하지 않는다 — 완료 상태를 공유화면에 남기기 위해.)
export async function leaveEventProgress(userId: string): Promise<void> {
  await supabase.from('event_progress').delete().eq('user_id', userId)
}

export type EventBoardRow = {
  userId: string
  name: string
  position: number
  mode: EventMode | null
  createdAt: string
}

// event_board는 이름까지 안전하게 노출하는 anon 공개 뷰다(event_progress 직접
// 조회로는 profiles가 anon에게 안 열려있어 이름을 못 가져온다).
export async function fetchEventBoard(): Promise<EventBoardRow[]> {
  const { data } = await supabase
    .from('event_board')
    .select('user_id, position, name, mode, created_at')
    .order('created_at', { ascending: true })
  return (data ?? []).map((r) => ({
    userId: r.user_id,
    position: r.position,
    name: r.name ?? '?',
    mode: r.mode as EventMode | null,
    createdAt: r.created_at,
  }))
}

export type EventBoardChange = { userId: string; position: number; mode: EventMode | null; createdAt: string }

// 공유화면 구독: UPDATE/INSERT는 갱신, DELETE는 목록에서 제거
// (DELETE 페이로드의 old에는 기본적으로 PK만 담기므로 그 외 값을 신뢰하면 안 된다).
export function subscribeToEventBoard(
  onUpsert: (row: EventBoardChange) => void,
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
      const row = payload.new as { user_id: string; position: number; mode: EventMode | null; created_at: string }
      onUpsert({ userId: row.user_id, position: row.position, mode: row.mode, createdAt: row.created_at })
    })
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}
