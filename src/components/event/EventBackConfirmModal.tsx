type Props = {
  onCancel: () => void
  onConfirm: () => void
}

export default function EventBackConfirmModal({ onCancel, onConfirm }: Props) {
  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-navy-deep/40 sm:items-center" onClick={onCancel}>
      <div
        className="w-full max-w-[420px] rounded-t-[24px] bg-cream p-5 pb-7 sm:rounded-[24px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[16.5px] font-extrabold text-navy">모드 선택으로 돌아갈까요?</div>
        <div className="mt-2 text-[13px] leading-relaxed text-text-muted">
          돌아가면 처음부터 기존에 쌓았던 구절이 사라집니다.
        </div>
        <div className="mt-4.5 flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 rounded-2xl bg-white py-3.5 text-center text-[13.5px] font-bold text-navy shadow-[0_2px_8px_rgba(31,43,64,0.1)]"
          >
            취소
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-2xl bg-coral py-3.5 text-center text-[13.5px] font-bold text-white">
            돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}
