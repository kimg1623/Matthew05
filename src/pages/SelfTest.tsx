import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { getChapterVerseNumbers, getWeek } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import Header from '@/components/Header'
import TabSwitcher, { type TestMode } from '@/components/TabSwitcher'
import ProgressBar from '@/components/ProgressBar'
import BlurTest from '@/components/selftest/BlurTest'
import ClozeTest from '@/components/selftest/ClozeTest'
import WordOrderTest from '@/components/selftest/WordOrderTest'
import type { FinishResult } from '@/components/selftest/types'

const VALID_MODES: TestMode[] = ['order', 'cloze', 'blur']
const PROGRESS_UNIT: Record<TestMode, string> = {
  order: '완료',
  cloze: '정답 확인',
  blur: '확인함',
}

export default function SelfTest() {
  const { n, mode } = useParams()
  const chapterN = Number(n)
  const week = getWeek(chapterN)
  const navigate = useNavigate()
  const { user } = useAuth()
  const [progress, setProgress] = useState(0)
  // "테스트 완료" 버튼은 insert가 끝날 때까지 화면에 그대로 남아있어서, 응답이 느릴 때 연속으로
  // 누르면 같은 결과가 여러 번 저장되던 버그가 있었다 — 첫 호출 이후는 전부 무시한다.
  const finishedRef = useRef(false)

  if (!week || !mode || !VALID_MODES.includes(mode as TestMode)) {
    return <Navigate to="/" replace />
  }
  const testMode = mode as TestMode
  const verseNumbers = getChapterVerseNumbers(week)
  const total = verseNumbers.length
  const percent = total === 0 ? 0 : Math.round((progress / total) * 100)

  async function handleFinish(result: FinishResult) {
    if (finishedRef.current) return
    finishedRef.current = true

    if (user && result.total > 0) {
      await supabase.from('test_attempts').insert({
        user_id: user.id,
        chapter: chapterN,
        mode: testMode,
        correct: result.correct,
        total: result.total,
        gradable: result.gradable,
      })
    }
    navigate(`/chapter/${chapterN}/test/${testMode}/complete`, {
      state: { chapterN, mode: testMode, weekTitle: week!.title, range: week!.range, ...result },
    })
  }

  return (
    <div className="mx-auto min-h-screen max-w-[480px] bg-cream">
      <Header title={`${chapterN}챕터 셀프테스트`} subtitle={week.title}>
        <ProgressBar label={`${progress}/${total} ${PROGRESS_UNIT[testMode]}`} percent={percent} />
      </Header>
      <TabSwitcher chapterN={chapterN} activeMode={testMode} />

      {testMode === 'blur' && (
        <BlurTest chapterN={chapterN} verseNumbers={verseNumbers} onProgress={setProgress} onFinish={handleFinish} />
      )}
      {testMode === 'cloze' && (
        <ClozeTest chapterN={chapterN} verseNumbers={verseNumbers} onProgress={setProgress} onFinish={handleFinish} />
      )}
      {testMode === 'order' && (
        <WordOrderTest chapterN={chapterN} verseNumbers={verseNumbers} onProgress={setProgress} onFinish={handleFinish} />
      )}
    </div>
  )
}
