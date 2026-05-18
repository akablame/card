import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import type { CardData } from '../types'
import { renderFront, renderBack } from '../utils/canvas'
import { downloadPDF, renderPageCanvas, PAGE_W_PX, PAGE_H_PX } from '../utils/pdf'
import { useDebounce } from '../hooks/useDebounce'

// Fixed preview buffer: A4 at ~90 DPI — fast, sharp enough for a layout preview
const PREV_W = 630
const PREV_H = Math.round(PREV_W * PAGE_H_PX / PAGE_W_PX)

interface Props {
  cards: CardData[]
  onDownload: () => void
}

export function Preview({ cards, onDownload }: Props) {
  // 4 fixed ref pairs — hooks cannot be conditional
  const f0 = useRef<HTMLCanvasElement>(null)
  const b0 = useRef<HTMLCanvasElement>(null)
  const f1 = useRef<HTMLCanvasElement>(null)
  const b1 = useRef<HTMLCanvasElement>(null)
  const f2 = useRef<HTMLCanvasElement>(null)
  const b2 = useRef<HTMLCanvasElement>(null)
  const f3 = useRef<HTMLCanvasElement>(null)
  const b3 = useRef<HTMLCanvasElement>(null)
  const pdfPageRef = useRef<HTMLCanvasElement>(null)

  const allRefs = useMemo(
    () => [
      { front: f0, back: b0 },
      { front: f1, back: b1 },
      { front: f2, back: b2 },
      { front: f3, back: b3 },
    ],
    [],
  )

  const debouncedCards = useDebounce(cards, 350)
  const [rendering, setRendering] = useState(false)

  const render = useCallback(async () => {
    setRendering(true)
    try {
      await Promise.all(
        debouncedCards.flatMap((data, i) => [
          allRefs[i].front.current ? renderFront(allRefs[i].front.current!, data) : Promise.resolve(),
          allRefs[i].back.current  ? renderBack(allRefs[i].back.current!,   data) : Promise.resolve(),
        ]),
      )
      // Compose the A4 page preview from the now-rendered card canvases
      if (pdfPageRef.current) {
        const canvases = debouncedCards.map((_, i) => ({
          front: allRefs[i].front.current!,
          back:  allRefs[i].back.current!,
        }))
        const page = renderPageCanvas(canvases, true)
        const el = pdfPageRef.current
        el.width  = PREV_W
        el.height = PREV_H
        el.getContext('2d')!.drawImage(page, 0, 0, PREV_W, PREV_H)
      }
    } finally {
      setRendering(false)
    }
  }, [debouncedCards, allRefs])

  useEffect(() => { void render() }, [render])

  const handleDownload = useCallback(() => {
    const cardCanvases = cards.map((_, i) => ({
      front: allRefs[i].front.current!,
      back:  allRefs[i].back.current!,
    }))
    downloadPDF(cardCanvases)
    onDownload()
  }, [cards, allRefs, onDownload])

  // Keyboard shortcut: Ctrl/Cmd + Enter
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !rendering) {
        e.preventDefault()
        handleDownload()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleDownload, rendering])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-semibold text-stone-800">Pré-visualização</h2>
        <p className="text-sm text-stone-500">Atualizada automaticamente conforme você preenche.</p>
      </div>

      {/* A4 print layout preview */}
      <div className="flex flex-col gap-2">
        <SectionDivider label="Layout de Impressão" />
        <div className="rounded-xl overflow-hidden border border-stone-200 bg-stone-100 p-2.5 shadow-inner">
          <canvas
            ref={pdfPageRef}
            width={PREV_W}
            height={PREV_H}
            className="w-full rounded-lg shadow-sm block"
          />
        </div>
        <p className="text-xs text-stone-400 text-center">
          A4 retrato — as linhas tracejadas indicam onde cortar
        </p>
      </div>

      {/* Per-card detail previews */}
      <div className="flex flex-col gap-4">
        <SectionDivider label="Detalhes" />
        {cards.map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            {cards.length > 1 && (
              <span className="text-xs font-medium text-stone-500 pl-0.5">Carteirinha {i + 1}</span>
            )}
            <CanvasCard label="Frente">
              <canvas ref={allRefs[i].front} className="w-full block" />
            </CanvasCard>
            <CanvasCard label="Verso">
              <canvas ref={allRefs[i].back} className="w-full block" />
            </CanvasCard>
          </div>
        ))}
      </div>

      {/* Download */}
      <button
        onClick={handleDownload}
        disabled={rendering}
        className="group bg-stone-800 text-white rounded-xl py-3 px-6 text-sm font-semibold hover:bg-stone-700 active:bg-stone-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
      >
        {rendering ? (
          <>
            <SpinnerIcon />
            Renderizando...
          </>
        ) : (
          <>
            <DownloadIcon />
            Baixar PDF
            <span className="text-stone-400 text-xs font-normal ml-auto hidden sm:inline">
              Ctrl+Enter
            </span>
          </>
        )}
      </button>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 border-t border-stone-200" />
    </div>
  )
}

function CanvasCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden border border-stone-200 shadow-sm">
      <p className="text-xs font-medium text-stone-400 bg-stone-50 px-3 py-1.5 border-b border-stone-200 uppercase tracking-wider">
        {label}
      </p>
      {children}
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  )
}
