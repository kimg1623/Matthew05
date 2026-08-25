export default function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      aria-label="정답률 공개 여부"
      className={'relative h-[21px] w-[38px] rounded-full transition-colors ' + (on ? 'bg-teal' : 'bg-navy/15')}
    >
      <div
        className="absolute top-[2px] h-[17px] w-[17px] rounded-full bg-white shadow transition-all"
        style={{ left: on ? '19px' : '2px' }}
      />
    </button>
  )
}
