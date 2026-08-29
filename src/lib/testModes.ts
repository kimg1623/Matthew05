export type TestMode = 'order' | 'cloze' | 'blur'

export const TEST_MODES: TestMode[] = ['order', 'cloze', 'blur']

export const MODE_LABEL: Record<TestMode, string> = {
  order: '단어 배치',
  cloze: '빈칸 채우기',
  blur: '문장 가리기',
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function accuracyLabel(row: { correct: number; total: number; gradable: boolean }): string {
  if (!row.gradable || row.total === 0) return '—'
  return `${Math.round((row.correct / row.total) * 100)}%`
}
