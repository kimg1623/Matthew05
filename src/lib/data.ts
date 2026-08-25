import weeksJson from '@/data/weeks.json'
import versesJson from '@/data/verses.json'
import verseIconMapJson from '@/data/verse-icon-map.json'
import weekAccentColorJson from '@/data/week-accent-color.json'
import clozeBlanksJson from '@/data/cloze-blanks.json'

export type Week = {
  n: number
  from: number
  to: number
  range: string
  title: string
  tip: string
}

export const weeks: Week[] = weeksJson
export const verses: Record<string, string> = versesJson
export const verseIconMap: Record<string, string> = verseIconMapJson
export const weekAccentColor: Record<string, string> = weekAccentColorJson
export const clozeBlanks: Record<string, string[]> = clozeBlanksJson

export function getWeek(n: number): Week | undefined {
  return weeks.find((w) => w.n === n)
}

export function getVerseText(n: number): string {
  return verses[String(n)] ?? ''
}

export function getChapterVerseNumbers(week: Week): number[] {
  const nums: number[] = []
  for (let v = week.from; v <= week.to; v++) nums.push(v)
  return nums
}
