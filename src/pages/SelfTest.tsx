import { useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { getChapterVerseNumbers, getWeek } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { enqueuePendingAttempt } from '@/lib/pendingAttempts'
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
  const [saveError, setSaveError] = useState(false)
  // "테스트 완료" 버튼은 insert가 끝날 때까지 화면에 그대로 남아있어서, 응답이 느릴 때 연속으로
  // 누르면 같은 결과가 여러 번 저장되던 버그가 있었다 — 첫 호출 이후는 전부 무시한다.
  // 저장이 실패하면 false로 되돌려서 같은 버튼을 다시 눌러 재시도할 수 있게 한다.
  const finishedRef = useRef(false)

  if (!week || !mode || !VALID_MODES.includes(mode as TestMode)) {
    return <Navigate to="/" replace />
  }
  const testMode = mode as TestMode
  const verseNumbers = getChapterVerseNumbers(week)
  const total = verseNumbers.length
  const percent = total === 0 ? 0 : Math.round((progress / total) * 100)

  async function saveAttempt(result: FinishResult) {
    if (!user || result.total <= 0) return
    const row = {
      user_id: user.id,
      chapter: chapterN,
      mode: testMode,
      correct: result.correct,
      total: result.total,
      gradable: result.gradable,
    }
    let { error } = await supabase.from('test_attempts').insert(row)
    if (error) {
      // 네트워크 순간 끊김 등 일시적 오류일 수 있으니 한 번은 조용히 재시도한다.
      ;({ error } = await supabase.from('test_attempts').insert(row))
    }
    if (!error) return

    // 여기까지 실패하면 오프라인이거나 서버 쪽 일시 장애일 가능성이 높다. 학생을 붙잡아두는 대신
    // 기기에 저장해두고 완료 화면으로 보낸다 — 로그인 직후/인터넷 재연결 시 자동으로 재전송된다.
    try {
      enqueuePendingAttempt(row)
    } catch {
      // localStorage까지 막힌 극히 드문 경우에만 학생에게 직접 재시도를 요청한다.
      throw new Error('save-failed')
    }
  }

  async function handleFinish(result: FinishResult) {
    if (finishedRef.current) return
    finishedRef.current = true
    setSaveError(false)

    try {
      await saveAttempt(result)
    } catch {
      finishedRef.current = false
      setSaveError(true)
      return
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

      {saveError && (
        <div className="mx-4 mt-4 rounded-2xl bg-coral/10 px-3.5 py-2.5 text-[13px] font-semibold text-coral">
          저장 중 문제가 발생했어요. 인터넷 연결을 확인하고 완료 버튼을 다시 눌러주세요.
        </div>
      )}

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
