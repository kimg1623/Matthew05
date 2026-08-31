import { Link } from 'react-router-dom'
import { MODE_COLORS, MODE_LABEL, TEST_MODES, type TestMode } from '@/lib/testModes'

export type { TestMode }

export default function TabSwitcher({ chapterN, activeMode }: { chapterN: number; activeMode: TestMode }) {
  return (
    <div className="mx-4 mt-4 flex gap-1 rounded-2xl bg-white p-1 shadow-[0_2px_8px_rgba(31,43,64,0.06)]">
      {TEST_MODES.map((mode) => {
        const colors = MODE_COLORS[mode]
        const active = activeMode === mode
        return (
          <Link
            key={mode}
            to={`/chapter/${chapterN}/test/${mode}`}
            replace
            style={active ? { backgroundColor: colors.solid } : undefined}
            className={'flex-1 rounded-[10px] py-2.5 text-center text-xs ' + (active ? 'font-bold text-cream' : 'font-semibold ' + colors.bg + ' ' + colors.text)}
          >
            {MODE_LABEL[mode]}
          </Link>
        )
      })}
    </div>
  )
}
