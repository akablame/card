import { jsPDF } from 'jspdf'

const SCALE = 12
const PAGE_W_MM = 210
const PAGE_H_MM = 297
export const PAGE_W_PX = PAGE_W_MM * SCALE // 2520
export const PAGE_H_PX = PAGE_H_MM * SCALE // 3564

const CARD_W_MM = 95
const CARD_H_MM = 65
const CARD_W_PX = CARD_W_MM * SCALE // 1140
const CARD_H_PX = CARD_H_MM * SCALE //  780

const H_MARGIN_PX = ((PAGE_W_MM - CARD_W_MM * 2) / 2) * SCALE // 120
const V_MARGIN_PX = 10 * SCALE                                   // 120
const ROW_GAP_PX  =  5 * SCALE                                   //  60
// 4 rows: 120 + 4×780 + 3×60 + 120 = 3540 ≤ 3564 ✓

function drawCutGuides(ctx: CanvasRenderingContext2D, count: number): void {
  ctx.save()
  ctx.strokeStyle = '#c0c0c0'
  ctx.lineWidth = 3
  ctx.setLineDash([12, 8])
  for (let i = 0; i < count; i++) {
    const y = V_MARGIN_PX + i * (CARD_H_PX + ROW_GAP_PX)
    ctx.strokeRect(H_MARGIN_PX, y, CARD_W_PX * 2, CARD_H_PX)
  }
  ctx.restore()
}

export function renderPageCanvas(
  cards: Array<{ front: HTMLCanvasElement; back: HTMLCanvasElement }>,
  guides = false,
): HTMLCanvasElement {
  const page = document.createElement('canvas')
  page.width  = PAGE_W_PX
  page.height = PAGE_H_PX
  const ctx = page.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, PAGE_W_PX, PAGE_H_PX)

  for (let i = 0; i < cards.length; i++) {
    const y = V_MARGIN_PX + i * (CARD_H_PX + ROW_GAP_PX)
    ctx.drawImage(cards[i].front, H_MARGIN_PX,             y, CARD_W_PX, CARD_H_PX)
    ctx.drawImage(cards[i].back,  H_MARGIN_PX + CARD_W_PX, y, CARD_W_PX, CARD_H_PX)
  }

  if (guides) drawCutGuides(ctx, cards.length)

  return page
}

export function downloadPDF(
  cards: Array<{ front: HTMLCanvasElement; back: HTMLCanvasElement }>,
): void {
  const page = renderPageCanvas(cards, false)
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  pdf.addImage(page.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, PAGE_W_MM, PAGE_H_MM)
  pdf.save('carteirinha.pdf')
}
