import { weeks } from '@/lib/data'
import { ModeBadge, DateBadge } from '@/components/Badges'
import { MODE_COLORS, MODE_LABEL, TEST_MODES, accuracyLabel, type TestMode } from '@/lib/testModes'

export type AttemptRow = {
  id: number
  chapter: number
  mode: TestMode
  correct: number
  total: number
  gradable: boolean
  created_at: string
}

type CountMap = Record<number, Record<TestMode, number>>

function emptyCounts(): CountMap {
  const map = {} as CountMap
  for (const week of weeks) {
    map[week.n] = { order: 0, cloze: 0, blur: 0 }
  }
  return map
}

export default function ChapterProgress({ attempts, loading }: { attempts: AttemptRow[]; loading: boolean }) {
  const counts = emptyCounts()
  for (const a of attempts) {
    if (counts[a.chapter]) counts[a.chapter][a.mode] += 1
  }

  const recent = attempts.slice(0, 8)

  return (
    <>
      <div className="px-5 pt-6 text-[12.5px] font-bold text-text-muted">챕터별 완료 현황</div>
      <div className="flex flex-col gap-2 px-4 pt-2.5">
        {weeks.map((week) => (
          <div
            key={week.n}
            className="flex items-center gap-3 rounded-2xl bg-white p-3 px-3.5 shadow-[0_2px_8px_rgba(31,43,64,0.06)]"
          >
            <span className="w-11 shrink-0 text-[13.5px] font-extrabold text-navy">{week.n}챕터</span>
            <div className="flex flex-1 gap-1.5">
              {TEST_MODES.map((mode) => {
                const n = counts[week.n][mode]
                const colors = MODE_COLORS[mode]
                return (
                  <div
                    key={mode}
                    className={
                      'flex flex-1 flex-col items-center gap-0.5 rounded-[10px] py-1.5 ' +
                      (n > 0 ? colors.bg : 'bg-navy/[0.05]')
                    }
                  >
                    <span className={'text-[13px] font-extrabold ' + (n > 0 ? colors.text : 'text-navy/30')}>{n}</span>
                    <span className="text-[8.5px] font-bold text-text-muted">{MODE_LABEL[mode]}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pt-6 text-[12.5px] font-bold text-text-muted">최근 활동</div>
      <div className="flex flex-col gap-2.5 px-4 pt-2.5">
        {loading && <div className="py-10 text-center text-sm text-text-muted">불러오는 중...</div>}
        {!loading && recent.length === 0 && (
          <div className="py-10 text-center text-sm text-text-muted">아직 완료한 테스트가 없어요.</div>
        )}
        {recent.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-3 rounded-2xl bg-white p-3.5 px-4 shadow-[0_2px_8px_rgba(31,43,64,0.06)]"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <ModeBadge mode={a.mode} />
                <DateBadge iso={a.created_at} />
              </div>
              <div className="mt-1.5 text-[12.5px] text-text-muted">
                {a.chapter}챕터 · {weeks.find((w) => w.n === a.chapter)?.title}
              </div>
            </div>
            <div className="text-right text-[15px] font-extrabold text-teal-deep">{accuracyLabel(a)}</div>
          </div>
        ))}
      </div>
    </>
  )
}
