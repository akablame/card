import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import type { CardData } from '../types'
import { renderFront, renderBack } from '../utils/canvas'
import { downloadPDF, renderPageCanvas, PAGE_W_PX, PAGE_H_PX } from '../utils/pdf'
import { useDebounce } from '../hooks/useDebounce'

const PREV_W = 630
const PREV_H = Math.round(PREV_W * PAGE_H_PX / PAGE_W_PX)

interface Props {
  cards: CardData[]
  onDownload: () => void
}

export function Preview({ cards, onDownload }: Props) {
  const f0 = useRef<HTMLCanvasElement>(null); const b0 = useRef<HTMLCanvasElement>(null)
  const f1 = useRef<HTMLCanvasElement>(null); const b1 = useRef<HTMLCanvasElement>(null)
  const f2 = useRef<HTMLCanvasElement>(null); const b2 = useRef<HTMLCanvasElement>(null)
  const f3 = useRef<HTMLCanvasElement>(null); const b3 = useRef<HTMLCanvasElement>(null)
  const pdfPageRef = useRef<HTMLCanvasElement>(null)

  const allRefs = useMemo(() => [
    { front: f0, back: b0 }, { front: f1, back: b1 },
    { front: f2, back: b2 }, { front: f3, back: b3 },
  ], [])

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
      if (pdfPageRef.current) {
        const page = renderPageCanvas(debouncedCards.map((_, i) => ({
          front: allRefs[i].front.current!,
          back:  allRefs[i].back.current!,
        })), true)
        const el = pdfPageRef.current
        el.width = PREV_W; el.height = PREV_H
        el.getContext('2d')!.drawImage(page, 0, 0, PREV_W, PREV_H)
      }
    } finally { setRendering(false) }
  }, [debouncedCards, allRefs])

  useEffect(() => { void render() }, [render])

  const handleDownload = useCallback(() => {
    downloadPDF(cards.map((_, i) => ({ front: allRefs[i].front.current!, back: allRefs[i].back.current! })))
    onDownload()
  }, [cards, allRefs, onDownload])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !rendering) { e.preventDefault(); handleDownload() } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [handleDownload, rendering])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="font-cinzel font-semibold uppercase tracking-wide text-base" style={{ color: '#3B1F0E' }}>
          Pré-visualização
        </h2>
        <p className="font-playfair italic text-sm mt-1" style={{ color: 'rgba(122,74,31,0.65)' }}>
          Atualizada automaticamente conforme você preenche.
        </p>
      </div>

      {/* A4 layout preview */}
      <div className="flex flex-col gap-2">
        <Divider label="Layout de Impressão" />
        <div className="rounded-xl overflow-hidden p-2.5"
          style={{ border: '1px solid rgba(122,74,31,0.15)', background: 'rgba(246,235,221,0.5)' }}>
          <canvas ref={pdfPageRef} width={PREV_W} height={PREV_H} className="w-full rounded-lg block shadow-sm" />
        </div>
        <p className="font-playfair italic text-xs text-center" style={{ color: 'rgba(122,74,31,0.5)' }}>
          A4 retrato — as linhas tracejadas indicam onde cortar
        </p>
      </div>

      {/* Per-card detail */}
      <div className="flex flex-col gap-4">
        <Divider label="Detalhes" />
        {cards.map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            {cards.length > 1 && (
              <span className="font-cinzel text-xs font-medium uppercase tracking-widest" style={{ color: '#7A4A1F' }}>
                Carteirinha {i + 1}
              </span>
            )}
            <CanvasCard label="Frente"><canvas ref={allRefs[i].front} className="w-full block" /></CanvasCard>
            <CanvasCard label="Verso"><canvas ref={allRefs[i].back}  className="w-full block" /></CanvasCard>
          </div>
        ))}
      </div>

      {/* Download button — primary CTA, gold */}
      <DownloadButton loading={rendering} onClick={handleDownload} />
    </div>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-cinzel text-xs font-semibold uppercase tracking-widest whitespace-nowrap"
        style={{ color: 'rgba(122,74,31,0.6)' }}>
        {label}
      </span>
      <div className="flex-1" style={{ borderTop: '1px solid rgba(122,74,31,0.18)' }} />
    </div>
  )
}

function CanvasCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(122,74,31,0.18)' }}>
      <p className="font-cinzel text-xs font-medium uppercase tracking-widest px-3 py-2"
        style={{ color: 'rgba(122,74,31,0.65)', background: '#F6EBDD', borderBottom: '1px solid rgba(122,74,31,0.10)' }}>
        {label}
      </p>
      {children}
    </div>
  )
}

function DownloadButton({ loading, onClick }: { loading: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full rounded-xl py-3.5 px-6 font-cinzel text-sm font-semibold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ background: '#D4A017', boxShadow: '0 2px 8px rgba(212,160,23,0.35)' }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#B88A12' }}
      onMouseLeave={e => { e.currentTarget.style.background = '#D4A017' }}
    >
      {loading
        ? <><SpinnerIcon /> Renderizando...</>
        : <><DownloadIcon /> Baixar PDF <span className="ml-auto text-xs text-white/50 font-normal normal-case tracking-normal hidden sm:inline">Ctrl+Enter</span></>
      }
    </button>
  )
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
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
