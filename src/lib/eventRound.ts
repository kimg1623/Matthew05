import { supabase } from '@/lib/supabase'

export type EventRound = {
  isOpen: boolean
  startVerse: number | null
  endVerse: number | null
  updatedAt: string
}

type EventRoundRow = {
  is_open: boolean
  start_verse: number | null
  end_verse: number | null
  updated_at: string
}

function toEventRound(row: EventRoundRow): EventRound {
  return { isOpen: row.is_open, startVerse: row.start_verse, endVerse: row.end_verse, updatedAt: row.updated_at }
}

export async function fetchEventRound(): Promise<EventRound | null> {
  const { data } = await supabase
    .from('event_round')
    .select('is_open, start_verse, end_verse, updated_at')
    .eq('id', true)
    .maybeSingle()
  return data ? toEventRound(data as EventRoundRow) : null
}

export function subscribeToEventRound(onChange: (round: EventRound) => void) {
  const channel = supabase
    .channel('event-round')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'event_round' },
      (payload) => onChange(toEventRound(payload.new as EventRoundRow)),
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

export type RoundActionResult = { ok: true } | { ok: false; message: string }

export async function openEventRound(startVerse: number, endVerse: number): Promise<RoundActionResult> {
  const { data, error } = await supabase.functions.invoke('open-event-round', {
    body: { startVerse, endVerse },
  })
  if (error) return { ok: false, message: '요청 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.' }
  if (!data?.ok) return { ok: false, message: (data?.error as string) ?? '라운드를 여는 데 실패했어요.' }
  return { ok: true }
}

export async function closeEventRound(): Promise<RoundActionResult> {
  const { data, error } = await supabase.functions.invoke('close-event-round', { body: {} })
  if (error) return { ok: false, message: '요청 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.' }
  if (!data?.ok) return { ok: false, message: (data?.error as string) ?? '라운드를 종료하는 데 실패했어요.' }
  return { ok: true }
}
