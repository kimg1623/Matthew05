import { useEffect, useState } from 'react'

const FONT_HREF = 'https://fonts.googleapis.com/css2?family=Jua&display=swap'

function useGoogleFont(href: string) {
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [href])
}

function HideWord({ children }: { children: string }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <span
      onClick={() => setRevealed((v) => !v)}
      className={
        'inline-block cursor-pointer select-none rounded-[10px] border-2 px-2.5 transition-colors ' +
        (revealed ? 'border-teal bg-transparent text-teal' : 'border-gold bg-gold/10 text-transparent')
      }
    >
      {children}
    </span>
  )
}

export default function Good() {
  useGoogleFont(FONT_HREF)
  const [closingRevealed, setClosingRevealed] = useState(false)

  return (
    <div
      className="mx-auto min-h-screen max-w-[480px] bg-cream pb-10"
      style={{ fontFamily: '"Jua", "맑은 고딕", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif', letterSpacing: '0.04em' }}
    >
      <div className="bg-navy-deep px-6 pb-7 pt-8">
        <div className="text-2xl leading-snug text-white">긴 글을 외우면 좋은 이유 5가지</div>
        <div className="mt-3.5 h-[3px] w-10 rounded bg-gold" />
      </div>

      <div className="flex flex-col gap-3.5 px-4 pb-1.5 pt-6">
        <div className="flex gap-3 rounded-[20px] bg-white p-[18px] shadow-[0_2px_10px_rgba(31,43,64,0.08)]">
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-gold/15 text-base text-gold-deep">
            1
          </div>
          <div className="text-lg leading-[1.95]">
            런던 택시기사들에게 도시 전체 지도를 다 외우게 하는 실험을 했어요. 실험 결과 기억 저장소인{' '}
            <HideWord>해마</HideWord>의 크기가 실제로 커졌어요.
          </div>
        </div>

        <div className="flex gap-3 rounded-[20px] bg-white p-[18px] shadow-[0_2px_10px_rgba(31,43,64,0.08)]">
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-gold/15 text-base text-gold-deep">
            2
          </div>
          <div className="text-lg leading-[1.95]">
            새로운 문장을 외울 때마다, 뇌 속에 없던 <HideWord>길</HideWord>이 새로 뚫려요. 뇌를 더{' '}
            <HideWord>넓게</HideWord> 쓸 수 있어요.
          </div>
        </div>

        <div className="flex gap-3 rounded-[20px] bg-white p-[18px] shadow-[0_2px_10px_rgba(31,43,64,0.08)]">
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-gold/15 text-base text-gold-deep">
            3
          </div>
          <div className="text-lg leading-[1.95]">
            뇌의 암기 근육을 한번 키워두면, 다른 공부를 할 때에도 <HideWord>집중력</HideWord>과{' '}
            <HideWord>기억력</HideWord>이 같이 좋아져요.
          </div>
        </div>

        <div className="flex gap-3 rounded-[20px] bg-white p-[18px] shadow-[0_2px_10px_rgba(31,43,64,0.08)]">
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-gold/15 text-base text-gold-deep">
            4
          </div>
          <div className="text-lg leading-[1.95]">
            외운 말씀은 <HideWord>인터넷이 끊겨도, 폰이 없어도</HideWord> 마음속에서 바로 꺼내 쓸 수 있어요. 흔들릴
            때 붙잡을 것이 생겨요.
          </div>
        </div>

        <div className="flex gap-3 rounded-[20px] bg-white p-[18px] shadow-[0_2px_10px_rgba(31,43,64,0.08)]">
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-gold/15 text-base text-gold-deep">
            5
          </div>
          <div className="text-lg leading-[1.95]">
            계속 되뇐 말은 결국 내 <HideWord>생각</HideWord>이 되고, 내 <HideWord>생각</HideWord>은 결국 내{' '}
            <HideWord>삶</HideWord>이 돼요.
          </div>
        </div>
      </div>

      <div className="px-4 pt-5">
        <div
          onClick={() => setClosingRevealed((v) => !v)}
          className="cursor-pointer rounded-[20px] bg-navy-deep p-[22px] text-center"
        >
          <div
            className={
              'inline-block select-none rounded-2xl border-2 px-4 py-2.5 text-xl leading-[1.7] transition-colors ' +
              (closingRevealed ? 'border-gold bg-transparent text-white' : 'border-gold bg-gold/10 text-transparent')
            }
          >
            하나님과 함께 하는 유익한 삶,
            <br />
            마태복음 5장 암송으로!!
          </div>
          <div className={'mt-2.5 text-sm text-white/55 transition-opacity ' + (closingRevealed ? 'opacity-0' : 'opacity-100')}>
            탭하여 확인
          </div>
        </div>
      </div>
    </div>
  )
}
