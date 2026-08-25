export default function ProgressBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="mt-4">
      <div className="mb-1.5 text-[12.5px] font-semibold text-white/85">{label}</div>
      <div className="h-2 overflow-hidden rounded-full bg-white/15">
        <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
