import { verseIconMap, weekAccentColor } from '@/lib/data'

const ACCENT_NAME_BY_HEX: Record<string, string> = {
  '#F4A259': 'gold',
  '#5B9A8B': 'teal',
  '#E76F51': 'coral',
}

export function accentNameForChapter(chapterN: number): string {
  const hex = weekAccentColor[String(chapterN)]
  return ACCENT_NAME_BY_HEX[hex] ?? 'gold'
}

export function accentHexForChapter(chapterN: number): string {
  return weekAccentColor[String(chapterN)] ?? '#F4A259'
}

const ACCENT_TEXT_HEX_BY_NAME: Record<string, string> = {
  gold: '#E08E3E',
  teal: '#457B6E',
  coral: '#E76F51',
}

export function accentTextHexForChapter(chapterN: number): string {
  return ACCENT_TEXT_HEX_BY_NAME[accentNameForChapter(chapterN)]
}

export function accentTintForChapter(chapterN: number, alpha: number): string {
  const hex = accentHexForChapter(chapterN)
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function iconUrlForVerse(verseNumber: number, chapterN: number): string {
  const iconName = verseIconMap[String(verseNumber)] ?? 'scroll'
  const colorName = accentNameForChapter(chapterN)
  return `/icons/${iconName}-${colorName}.svg`
}

export function coverUrlForChapter(chapterN: number): string {
  return `/covers/cover-week${chapterN}.jpg`
}

export type VerseGroup = { icon: string; verseNumbers: number[] }

export function groupVersesByIcon(verseNumbers: number[]): VerseGroup[] {
  const groups: VerseGroup[] = []
  for (const v of verseNumbers) {
    const icon = verseIconMap[String(v)] ?? 'scroll'
    const last = groups[groups.length - 1]
    if (last && last.icon === icon) {
      last.verseNumbers.push(v)
    } else {
      groups.push({ icon, verseNumbers: [v] })
    }
  }
  return groups
}
