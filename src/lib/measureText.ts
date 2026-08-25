let canvas: HTMLCanvasElement | null = null

const INPUT_FONT = '700 14px "맑은 고딕", "Apple SD Gothic Neo", Pretendard, sans-serif'

export function measureTextWidth(text: string, font: string = INPUT_FONT): number {
  if (!canvas) canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return 0
  ctx.font = font
  return ctx.measureText(text).width
}
