import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchEventRound, subscribeToEventRound, type EventRound } from '@/lib/eventRound'
import { fetchEventBoard, subscribeToEventBoard, type EventBoardRow, type EventMode } from '@/lib/eventProgress'

const SAFETY_POLL_MS = 15000

// 공유화면(레이싱/카드 공용)이 쓰는 데이터: 라운드 상태 + 참가자 목록.
// 소켓이 조용히 끊겨도 15초 안에 스스로 복구되도록 안전망 재조회를 함께 돈다.
export function useEventBoard() {
  const [round, setRound] = useState<EventRound | null>(null)
  const [rows, setRows] = useState<Record<string, EventBoardRow>>({})

  const rowsRef = useRef(rows)
  rowsRef.current = rows

  useEffect(() => {
    let active = true
    fetchEventRound().then((r) => active && setRound(r))
    const unsubscribe = subscribeToEventRound((r) => active && setRound(r))
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const isOpen = Boolean(round?.isOpen)

  useEffect(() => {
    if (!isOpen) {
      setRows({}) // 종료된 라운드의 참가자 잔상이 다음 라운드 시작 때 잠깐 보이지 않게 비운다
      return
    }
    let active = true

    async function loadBoard() {
      const board = await fetchEventBoard()
      if (!active) return
      const map: Record<string, EventBoardRow> = {}
      for (const r of board) map[r.userId] = r
      setRows(map)
    }
    loadBoard()

    const unsubscribe = subscribeToEventBoard(
      async (change) => {
        if (!active) return
        const existing = rowsRef.current[change.userId]
        if (existing) {
          setRows((prev) => ({
            ...prev,
            [change.userId]: { ...existing, position: change.position, mode: change.mode as EventMode | null },
          }))
          return
        }
        // 새로 등장한 참가자 — 이름은 실시간 페이로드에 없으니 anon 공개 뷰에서 한 번 조회
        const { data } = await supabase.from('event_board').select('name').eq('user_id', change.userId).maybeSingle()
        if (!active) return
        setRows((prev) => ({
          ...prev,
          [change.userId]: {
            userId: change.userId,
            name: data?.name ?? '?',
            position: change.position,
            mode: change.mode,
            createdAt: change.createdAt,
          },
        }))
      },
      (userId) => {
        if (!active) return
        setRows((prev) => {
          const next = { ...prev }
          delete next[userId]
          return next
        })
      },
    )

    const interval = setInterval(loadBoard, SAFETY_POLL_MS)

    return () => {
      active = false
      unsubscribe()
      clearInterval(interval)
    }
  }, [isOpen, round?.updatedAt])

  const participants = Object.values(rows).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const length = round?.isOpen && round.startVerse && round.endVerse ? round.endVerse - round.startVerse + 1 : 0

  return { round, isOpen, participants, length }
}
