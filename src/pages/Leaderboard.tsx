import { useEffect, useState } from 'react'
import { GradeBadge, ModeBadge, DateBadge } from '@/components/Badges'
import StudentEditModal from '@/components/StudentEditModal'
import { supabase } from '@/lib/supabase'
import { GRADES, type Grade } from '@/lib/auth'
import { MODE_LABEL, TEST_MODES, formatDateTime, accuracyLabel, type TestMode } from '@/lib/testModes'

type SummaryRow = {
  user_id: string
  name: string
  grade: Grade
  completed_chapters: number
  avg_accuracy: number | null
}

type AttemptRow = {
  id: number
  user_id: string
  name: string
  grade: Grade
  chapter: number
  mode: TestMode
  correct: number
  total: number
  gradable: boolean
  created_at: string
}

type ViewMode = 'all' | 'date' | 'mode'

const GRADE_FILTERS = ['전체', ...GRADES] as const
const VIEW_TABS: { key: ViewMode; label: string }[] = [
  { key: 'all', label: '전체보기' },
  { key: 'date', label: '날짜별보기' },
  { key: 'mode', label: '테스트별보기' },
]

function todayDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Leaderboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-cream pb-24">
      <div className="bg-navy-deep px-6 pb-8 pt-9">
        <div className="text-[12.5px] font-bold text-gold">교사 전용</div>
        <div className="mt-2 text-[26px] font-extrabold leading-tight text-cream">리더보드</div>
        <div className="mt-3.5 h-[3px] w-10 rounded bg-gold" />
        <div className="mt-3.5 text-[13px] text-cream/65">누가 얼마나 완주했는지 확인해보세요</div>
      </div>

      <div className="flex gap-1.5 px-4 pt-4">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setViewMode(tab.key)}
            className={
              'flex-1 rounded-2xl py-2.5 text-center text-[12.5px] font-bold ' +
              (viewMode === tab.key ? 'bg-navy-deep text-cream' : 'bg-white text-text-muted')
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {viewMode === 'all' && <SummaryView />}
      {viewMode === 'date' && <DateView />}
      {viewMode === 'mode' && <ModeView />}
    </div>
  )
}

function SummaryView() {
  const [rows, setRows] = useState<SummaryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<(typeof GRADE_FILTERS)[number]>('전체')
  const [editingRow, setEditingRow] = useState<SummaryRow | null>(null)

  useEffect(() => {
    let active = true
    supabase
      .from('leaderboard')
      .select('*')
      .order('completed_chapters', { ascending: false })
      .then(({ data }) => {
        if (!active) return
        setRows((data ?? []) as SummaryRow[])
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = filter === '전체' ? rows : rows.filter((row) => row.grade === filter)

  return (
    <>
      <div className="flex gap-1.5 overflow-x-auto px-4 pt-3">
        {GRADE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              'shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold ' +
              (filter === f ? 'bg-navy-deep text-cream' : 'bg-white text-text-muted')
            }
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5 px-4 pb-8 pt-4">
        {loading && <div className="py-10 text-center text-sm text-text-muted">불러오는 중...</div>}
        {!loading && filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-text-muted">아직 기록이 없어요.</div>
        )}
        {filtered.map((row, i) => (
          <button
            key={row.user_id}
            onClick={() => setEditingRow(row)}
            className="flex items-center gap-3 rounded-2xl bg-white p-3.5 px-4 text-left shadow-[0_2px_8px_rgba(31,43,64,0.06)]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/[0.15] text-[13px] font-extrabold text-gold-deep">
              {i + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14.5px] font-bold text-navy">{row.name}</div>
              <div className="text-[11.5px] text-text-muted">{row.grade}</div>
            </div>
            <div className="text-right">
              <div className="text-[15px] font-extrabold text-teal-deep">{row.completed_chapters}/8챕터</div>
              {row.avg_accuracy !== null && (
                <div className="text-[11px] text-text-muted">평균 정답률 {row.avg_accuracy}%</div>
              )}
            </div>
          </button>
        ))}
      </div>

      {editingRow && (
        <StudentEditModal
          userId={editingRow.user_id}
          currentName={editingRow.name}
          onClose={() => setEditingRow(null)}
          onSaved={(newName) => {
            setRows((prev) => prev.map((r) => (r.user_id === editingRow.user_id ? { ...r, name: newName } : r)))
            setEditingRow(null)
          }}
        />
      )}
    </>
  )
}

function DateView() {
  const [date, setDate] = useState(todayDateString())
  const [rows, setRows] = useState<AttemptRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    const start = new Date(`${date}T00:00:00`).toISOString()
    const end = new Date(`${date}T23:59:59.999`).toISOString()
    supabase
      .from('attempt_feed')
      .select('*')
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!active) return
        setRows((data ?? []) as AttemptRow[])
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [date])

  return (
    <>
      <div className="px-4 pt-3">
        <input
          type="date"
          value={date}
          max={todayDateString()}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-[10px] border-[1.5px] border-gold/50 bg-white px-3.5 py-2.5 text-[14px] font-bold text-navy outline-none"
        />
      </div>

      <div className="flex flex-col gap-2.5 px-4 pb-8 pt-4">
        {loading && <div className="py-10 text-center text-sm text-text-muted">불러오는 중...</div>}
        {!loading && rows.length === 0 && (
          <div className="py-10 text-center text-sm text-text-muted">이 날 완료한 테스트가 없어요.</div>
        )}
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center gap-3 rounded-2xl bg-white p-3.5 px-4 shadow-[0_2px_8px_rgba(31,43,64,0.06)]"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[14.5px] font-bold text-navy">{row.name}</span>
                <GradeBadge grade={row.grade} />
                <ModeBadge mode={row.mode} />
              </div>
              <div className="mt-1 text-[11.5px] text-text-muted">
                {row.chapter}챕터 · {formatDateTime(row.created_at)}
              </div>
            </div>
            <div className="text-right text-[15px] font-extrabold text-teal-deep">{accuracyLabel(row)}</div>
          </div>
        ))}
      </div>
    </>
  )
}

function ModeView() {
  const [mode, setMode] = useState<TestMode>('order')
  const [rows, setRows] = useState<AttemptRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    supabase
      .from('attempt_feed')
      .select('*')
      .eq('mode', mode)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (!active) return
        setRows((data ?? []) as AttemptRow[])
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [mode])

  return (
    <>
      <div className="flex gap-1.5 px-4 pt-3">
        {TEST_MODES.map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={
              'flex-1 rounded-full py-1.5 text-center text-[12.5px] font-bold ' +
              (mode === m ? 'bg-navy-deep text-cream' : 'bg-white text-text-muted')
            }
          >
            {MODE_LABEL[m]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5 px-4 pb-8 pt-4">
        {loading && <div className="py-10 text-center text-sm text-text-muted">불러오는 중...</div>}
        {!loading && rows.length === 0 && (
          <div className="py-10 text-center text-sm text-text-muted">아직 기록이 없어요.</div>
        )}
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex items-center gap-3 rounded-2xl bg-white p-3.5 px-4 shadow-[0_2px_8px_rgba(31,43,64,0.06)]"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[14.5px] font-bold text-navy">{row.name}</span>
                <GradeBadge grade={row.grade} />
                <DateBadge iso={row.created_at} />
              </div>
              <div className="mt-1 text-[11.5px] text-text-muted">{row.chapter}챕터</div>
            </div>
            <div className="text-right text-[15px] font-extrabold text-teal-deep">{accuracyLabel(row)}</div>
          </div>
        ))}
      </div>
    </>
  )
}
