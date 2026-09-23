import { getVerseText } from '@/lib/data'

const TARGET_CHUNKS = 6

// 절 길이에 관계없이 카드 수가 대략 비슷해지도록(목표 6개 안팎) 인접 단어를 묶는다.
// 청크 경계는 절 번호 + targetChunks만으로 결정되는 순수 함수라 모든 학생에게 항상 동일하다.
export function chunkVerse(verseNumber: number, targetChunks = TARGET_CHUNKS): string[] {
  const words = getVerseText(verseNumber).split(' ').filter(Boolean)
  const n = words.length
  if (n === 0) return []
  if (n <= targetChunks) return words // 이미 충분히 짧음 — 단어 하나 = 청크 하나

  const wordsPerChunk = Math.ceil(n / targetChunks)
  const chunkCount = Math.ceil(n / wordsPerChunk)
  const base = Math.floor(n / chunkCount)
  const remainder = n % chunkCount // 앞의 remainder개 청크가 한 단어씩 더 가짐

  const chunks: string[] = []
  let i = 0
  for (let c = 0; c < chunkCount; c++) {
    const size = base + (c < remainder ? 1 : 0)
    chunks.push(words.slice(i, i + size).join(' '))
    i += size
  }
  return chunks
}
