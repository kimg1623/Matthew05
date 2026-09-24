import type { EventBoardRow } from '@/lib/eventProgress'

const MODE_LABEL = { all: '한 번에 쌓기', one: '한 절씩 쌓기' } as const

const MODE_STYLE = {
  all: 'bg-gold/20 text-[#A85F14]',
  one: 'bg-teal/20 text-teal-deep',
} as const

// 카드판 공유화면의 학생 카드 1장. 이름 → 방식 뱃지 → 쌓은 카드 수 뱃지(다 쌓으면 초록색).
export default function EventParticipantCard({ row, total }: { row: EventBoardRow; total: number }) {
  const done = Boolean(row.mode) && row.position >= total

  return (
    <li
      className={
        'event-card-pop flex min-h-[108px] flex-col justify-between gap-2 rounded-[14px] border-[1.5px] p-3 transition-colors duration-300 ' +
        (done
          ? 'border-[#2F9E5F] bg-[#F3FBF6] shadow-[0_3px_12px_rgba(47,158,95,0.18)]'
          : 'border-navy/[0.08] bg-white shadow-[0_3px_10px_rgba(31,43,64,0.07)]')
      }
    >
      <div className="break-words text-[17px] font-extrabold leading-tight text-navy-deep">{row.name}</div>

      {row.mode ? (
        <span className={'self-start rounded-full px-2.5 py-1 text-[11.5px] font-extrabold ' + MODE_STYLE[row.mode]}>
          {MODE_LABEL[row.mode]}
        </span>
      ) : (
        <span className="self-start rounded-full border-[1.5px] border-dashed border-navy/[0.18] px-2.5 py-1 text-[11.5px] font-semibold text-text-muted">
          방식 고르는 중
        </span>
      )}

      <span
        aria-label={done ? '카드를 모두 쌓았어요' : `${total}장 중 ${row.position}장 쌓았어요`}
        className={
          'inline-flex items-center gap-1.5 self-start rounded-full py-1 pl-2 pr-2.5 text-[13px] font-extrabold tabular-nums transition-colors duration-300 ' +
          (row.mode ? '' : 'invisible ') +
          (done ? 'bg-[#2F9E5F] text-white' : 'bg-navy/[0.08] text-navy')
        }
      >
        {done ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5 9-9" />
          </svg>
        ) : (
          <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
            <rect y="0" width="14" height="3" rx="1.5" fill="currentColor" />
            <rect y="4" width="14" height="3" rx="1.5" fill="currentColor" opacity={0.75} />
            <rect y="8" width="14" height="3" rx="1.5" fill="currentColor" opacity={0.5} />
          </svg>
        )}
        <span key={row.position} className="event-count-bump">
          {row.position} / {total}
        </span>
      </span>
    </li>
  )
}
