export default function EventWaitingRoom() {
  return (
    <div className="flex flex-col items-center gap-3.5 px-6 py-16 text-center">
      <div className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-gold/[0.14]">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E08E3E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      </div>
      <div className="text-[15px] font-extrabold leading-relaxed text-navy">
        선생님이 공유화면에서
        <br />
        성경구절쌓기를 시작하면
        <br />
        자동으로 화면이 바뀌어요.
      </div>
    </div>
  )
}
