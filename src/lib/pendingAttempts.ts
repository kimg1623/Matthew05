import { supabase } from '@/lib/supabase'
import type { TestMode } from '@/lib/testModes'

const STORAGE_KEY = 'mt5:pending-attempts'

type PendingAttempt = {
  user_id: string
  chapter: number
  mode: TestMode
  correct: number
  total: number
  gradable: boolean
}

function loadQueue(): PendingAttempt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PendingAttempt[]) : []
  } catch {
    return []
  }
}

function saveQueue(queue: PendingAttempt[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
  } catch {
    // localStorage를 못 쓰는 극히 드문 환경 — 호출부에서 즉시 재시도 실패를 별도로 처리한다.
  }
}

// 저장 실패한 시도를 로컬 큐에 넣는다. 이 함수 자체가 던지면(localStorage 완전 차단 등)
// 호출부가 fallback으로 화면에 재시도 안내를 띄운다.
export function enqueuePendingAttempt(attempt: PendingAttempt) {
  const queue = loadQueue()
  queue.push(attempt)
  saveQueue(queue)
}

let flushing = false

// 큐에 쌓인 시도를 다시 저장 시도한다. 로그인 직후 / 인터넷 재연결 시 / 로그아웃 직전에 호출된다.
// 큐의 user_id가 지금 로그인된 사용자와 다르면(기기를 다른 사람이 넘겨받은 경우) 건드리지 않고
// 다음 기회로 남겨둔다 — RLS도 어차피 막지만, 애초에 잘못된 세션으로 시도하지 않기 위함이다.
export async function flushPendingAttempts(currentUserId: string): Promise<void> {
  if (flushing) return
  const queue = loadQueue()
  if (queue.length === 0) return

  flushing = true
  try {
    const remaining: PendingAttempt[] = []
    for (const attempt of queue) {
      if (attempt.user_id !== currentUserId) {
        remaining.push(attempt)
        continue
      }
      const { error } = await supabase.from('test_attempts').insert(attempt)
      if (error) remaining.push(attempt)
    }
    saveQueue(remaining)
  } finally {
    flushing = false
  }
}
