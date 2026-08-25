export type FinishResult = {
  correct: number
  total: number
  gradable: boolean
}

export type SelfTestProps = {
  chapterN: number
  verseNumbers: number[]
  onProgress: (n: number) => void
  onFinish: (result: FinishResult) => void
}
