import { Link } from 'react-router-dom'

export type TestMode = 'order' | 'cloze' | 'blur'

const TABS: { mode: TestMode; label: string }[] = [
  { mode: 'order', label: '단어 배치' },
  { mode: 'cloze', label: '빈칸 채우기' },
  { mode: 'blur', label: '문장 가리기' },
]

export default function TabSwitcher({ chapterN, activeMode }: { chapterN: number; activeMode: TestMode }) {
  return (
    <div className="mx-4 mt-4 flex gap-1 rounded-2xl bg-white p-1 shadow-[0_2px_8px_rgba(31,43,64,0.06)]">
      {TABS.map((t) => (
        <Link
          key={t.mode}
          to={`/chapter/${chapterN}/test/${t.mode}`}
          replace
          className={
            'flex-1 rounded-[10px] py-2.5 text-center text-xs ' +
            (activeMode === t.mode ? 'bg-navy-deep font-bold text-cream' : 'font-semibold text-text-muted')
          }
        >
          {t.label}
        </Link>
      ))}
    </div>
  )
}
