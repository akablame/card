import frenteUrl from '../assets/frente.png'
import versoUrl from '../assets/verso.png'
import type { CardData } from '../types'

// ─── Layout configuration ──────────────────────────────────────────────────────
// All coordinates are in pixels relative to the full-size template image.
// Adjust these values to fine-tune exact element positions.

const FRONT = {
  bg: frenteUrl,
  canvasWidth:  1515,
  canvasHeight: 1043,

  // Top-left corner (x, y) and size (w, h) of the photo area
  photo: { x: 97, y: 238, w: 304, h: 400 },

  font: {
    size: 38,
    family: 'Allura',
    color: '#2d1b0e',
    bold: true,
  },

  // Baseline (y) and left-edge (x) for each value field
  fields: {
    nome:       { x: 555, y: 350 },
    dataInicio: { x: 555, y: 483 },
    categoria:  { x: 555, y: 620 },
    matricula:  { x: 555, y: 755 },
  },
}

const BACK = {
  bg: versoUrl,
  canvasWidth:  1515,
  canvasHeight: 1043,

  font: {
    size: 38,
    family: 'Allura',
    color: '#2d1b0e',
    bold: true,
  },

  fields: {
    cpf:      { x: 243, y: 398 },
    rg:       { x: 243, y: 532 },
    endereco: { x: 243, y: 675 },
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

function applyFont(
  ctx: CanvasRenderingContext2D,
  font: { size: number; family: string; color: string; bold: boolean },
): void {
  ctx.font = `${font.bold ? 'bold ' : ''}${font.size}px ${font.family}`
  ctx.fillStyle = font.color
  ctx.textBaseline = 'alphabetic'
}

// "2025-04-01" → "01/04/2025"
function fmtDate(iso: string): string {
  const parts = iso.split('-')
  if (parts.length !== 3) return iso
  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

// ─── Render functions ─────────────────────────────────────────────────────────

export async function renderFront(
  canvas: HTMLCanvasElement,
  data: CardData,
): Promise<void> {
  canvas.width  = FRONT.canvasWidth
  canvas.height = FRONT.canvasHeight
  const ctx = canvas.getContext('2d')!

  ctx.translate(0, 5)

  const bg = await loadImage(FRONT.bg)
  ctx.drawImage(bg, 0, 0, 1515, 1038)

  if (data.foto) {
    const photoUrl = URL.createObjectURL(data.foto)
    try {
      const photo = await loadImage(photoUrl)
      const { x, y, w, h } = FRONT.photo
      ctx.drawImage(photo, x, y, w, h)
    } finally {
      URL.revokeObjectURL(photoUrl)
    }
  }

  applyFont(ctx, FRONT.font)
  const f = FRONT.fields
  ctx.fillText(data.nome,                f.nome.x,       f.nome.y)
  ctx.fillText(fmtDate(data.dataInicio), f.dataInicio.x, f.dataInicio.y)
  ctx.fillText(data.categoria,           f.categoria.x,  f.categoria.y)
  ctx.fillText(data.matricula,           f.matricula.x,  f.matricula.y)
}

export async function renderBack(
  canvas: HTMLCanvasElement,
  data: CardData,
): Promise<void> {
  canvas.width  = BACK.canvasWidth
  canvas.height = BACK.canvasHeight
  const ctx = canvas.getContext('2d')!

  const bg = await loadImage(BACK.bg)
  ctx.drawImage(bg, 0, 0, 1513, 1039)

  applyFont(ctx, BACK.font)
  const f = BACK.fields
  ctx.fillText(data.cpf,      f.cpf.x,      f.cpf.y)
  ctx.fillText(data.rg,       f.rg.x,       f.rg.y)
  ctx.fillText(data.endereco, f.endereco.x, f.endereco.y)
}
