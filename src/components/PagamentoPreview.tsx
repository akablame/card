import { useEffect, useRef, useCallback, useState } from 'react'
import type { PagamentoData } from '../types'
import { renderPagamentoFront, renderPagamentoBack } from '../utils/canvas'
import { downloadPagamentoPDF } from '../utils/pdf'
import { useDebounce } from '../hooks/useDebounce'

export function PagamentoPreview({ data, onDownload }: { data: PagamentoData; onDownload: () => void }) {
  const frontRef = useRef<HTMLCanvasElement>(null)
  const backRef  = useRef<HTMLCanvasElement>(null)
  const [rendering, setRendering] = useState(false)
  const debouncedData = useDebounce(data, 350)

  const render = useCallback(async () => {
    setRendering(true)
    try {
      await Promise.all([
        frontRef.current ? renderPagamentoFront(frontRef.current, debouncedData) : Promise.resolve(),
        backRef.current  ? renderPagamentoBack(backRef.current) : Promise.resolve(),
      ])
    } finally { setRendering(false) }
  }, [debouncedData])

  useEffect(() => { void render() }, [render])

  const handleDownload = useCallback(() => {
    if (!frontRef.current || !backRef.current) return
    downloadPagamentoPDF([{ front: frontRef.current, back: backRef.current }])
    onDownload()
  }, [onDownload])

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !rendering) { e.preventDefault(); handleDownload() } }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [handleDownload, rendering])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-cinzel font-semibold uppercase tracking-wide text-base" style={{ color: '#3B1F0E' }}>
          Pré-visualização
        </h2>
        <p className="font-playfair italic text-sm mt-1" style={{ color: 'rgba(122,74,31,0.65)' }}>
          Atualizada automaticamente conforme você preenche.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Divider label="Frente" />
        <CanvasCard><canvas ref={frontRef} className="w-full block" /></CanvasCard>

        <Divider label="Verso" />
        <CanvasCard><canvas ref={backRef} className="w-full block" /></CanvasCard>
      </div>

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

function CanvasCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(122,74,31,0.18)' }}>
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
