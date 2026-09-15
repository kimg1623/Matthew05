import type { AttemptRow } from '@/components/ChapterProgress'
import { weeks } from '@/lib/data'
import { TEST_MODES, type TestMode } from '@/lib/testModes'
import { accentNameForChapter, accentHexForChapter } from '@/lib/icons'

export type AchievementCategory = 'attendance' | 'quest' | 'challenge'
export type AccentName = 'gold' | 'teal' | 'coral'

export type Achievement = {
  id: string
  category: AchievementCategory
  title: string
  unlockedDescription: string
  lockedHint: string
  unlocked: boolean
  iconName: string
  accentName: AccentName
  accentHex: string
  progress?: { current: number; target: number }
}

// 챕터에 속하지 않는 도전 뱃지용 — public/icons에 gold/teal/coral 3종이 다 없는
// 아이콘(mountain-gold만, stoneTablets-gold만, candle-teal만 존재)을 쓰기 때문에
// accentNameForChapter로 유도하지 않고 고정한다.
const FIXED_ACCENT: Record<AccentName, string> = { gold: '#F4A259', teal: '#5B9A8B', coral: '#E76F51' }

function toLocalDayNumber(iso: string): number {
  const d = new Date(iso)
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86_400_000)
}

// "최장 연속 출석일" — 현재 스트릭이 아니라 역대 최장 기록이라, 한 번 딴 뱃지는
// 학생이 며칠 쉬어도 사라지지 않는다.
export function longestStreak(attempts: AttemptRow[]): number {
  if (attempts.length === 0) return 0
  const days = Array.from(new Set(attempts.map((a) => toLocalDayNumber(a.created_at)))).sort((a, b) => a - b)
  let longest = 1
  let current = 1
  for (let i = 1; i < days.length; i++) {
    current = days[i] === days[i - 1] + 1 ? current + 1 : 1
    longest = Math.max(longest, current)
  }
  return longest
}

function buildAttendanceAchievements(attempts: AttemptRow[]): Achievement[] {
  const streak = longestStreak(attempts)
  const defs = [
    { id: 'attendance-1', target: 1, title: '첫 걸음', icon: 'footsteps', accent: 'gold' as const },
    { id: 'attendance-3', target: 3, title: '3일 연속 출석', icon: 'sprout', accent: 'teal' as const },
    { id: 'attendance-7', target: 7, title: '7일 연속 출석', icon: 'star', accent: 'coral' as const },
  ]
  return defs.map((d) => ({
    id: d.id,
    category: 'attendance' as const,
    title: d.title,
    unlockedDescription: `최장 ${streak}일 연속 출석을 달성했어요.`,
    lockedHint: `${d.target}일 연속으로 테스트를 풀면 달성해요.`,
    unlocked: streak >= d.target,
    iconName: d.icon,
    accentName: d.accent,
    accentHex: FIXED_ACCENT[d.accent],
    progress: { current: Math.min(streak, d.target), target: d.target },
  }))
}

function buildQuestAchievements(attempts: AttemptRow[]): Achievement[] {
  return weeks.map((week) => {
    const modesSeen = new Set(attempts.filter((a) => a.chapter === week.n).map((a) => a.mode))
    const current = TEST_MODES.filter((m: TestMode) => modesSeen.has(m)).length
    const accentName = accentNameForChapter(week.n) as AccentName
    return {
      id: `quest-${week.n}`,
      category: 'quest' as const,
      title: `${week.n}챕터 · ${week.title}`,
      unlockedDescription: `${week.range} 3가지 테스트를 모두 완료했어요.`,
      lockedHint: '단어 배치·빈칸 채우기·문장 가리기를 각 1회 이상 풀면 달성해요.',
      unlocked: current === TEST_MODES.length,
      iconName: 'scroll',
      accentName,
      accentHex: accentHexForChapter(week.n),
      progress: { current, target: TEST_MODES.length },
    }
  })
}

function buildChallengeAchievements(attempts: AttemptRow[], quests: Achievement[]): Achievement[] {
  const hasPerfect = attempts.some((a) => a.gradable && a.total > 0 && a.correct === a.total)
  const chaptersAttempted = new Set(attempts.map((a) => a.chapter)).size
  const allQuestsDone = quests.length > 0 && quests.every((q) => q.unlocked)
  const VOLUME_TARGET = 20
  const totalAttempts = attempts.length

  const mk = (a: Omit<Achievement, 'accentHex'>): Achievement => ({ ...a, accentHex: FIXED_ACCENT[a.accentName] })

  return [
    mk({
      id: 'challenge-perfect',
      category: 'challenge',
      title: '만점의 순간',
      unlockedDescription: '테스트에서 100% 정답을 기록했어요.',
      lockedHint: '아무 테스트에서 100% 정답을 맞히면 달성해요.',
      unlocked: hasPerfect,
      iconName: 'star',
      accentName: 'gold',
    }),
    mk({
      id: 'challenge-all-chapters',
      category: 'challenge',
      title: '8장 모두 도전',
      unlockedDescription: '8개 챕터를 모두 한 번 이상 테스트했어요.',
      lockedHint: '8개 챕터 전부에서 테스트를 한 번씩 풀면 달성해요.',
      unlocked: chaptersAttempted === weeks.length,
      iconName: 'mountain',
      accentName: 'gold',
      progress: { current: chaptersAttempted, target: weeks.length },
    }),
    mk({
      id: 'challenge-master',
      category: 'challenge',
      title: '마스터 컬렉터',
      unlockedDescription: '8개 챕터 퀘스트 뱃지를 모두 모았어요.',
      lockedHint: '모든 챕터의 퀘스트 뱃지를 다 모으면 달성해요.',
      unlocked: allQuestsDone,
      iconName: 'stoneTablets',
      accentName: 'gold',
      progress: { current: quests.filter((q) => q.unlocked).length, target: quests.length },
    }),
    mk({
      id: 'challenge-volume',
      category: 'challenge',
      title: '열정 가득',
      unlockedDescription: `지금까지 테스트를 ${totalAttempts}회 풀었어요.`,
      lockedHint: `테스트를 총 ${VOLUME_TARGET}회 풀면 달성해요.`,
      unlocked: totalAttempts >= VOLUME_TARGET,
      iconName: 'candle',
      accentName: 'teal',
      progress: { current: Math.min(totalAttempts, VOLUME_TARGET), target: VOLUME_TARGET },
    }),
  ]
}

export function computeAchievements(attempts: AttemptRow[]): Achievement[] {
  const quest = buildQuestAchievements(attempts)
  return [...buildAttendanceAchievements(attempts), ...quest, ...buildChallengeAchievements(attempts, quest)]
}
