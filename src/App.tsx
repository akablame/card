import { useState, useCallback, useEffect } from 'react'
import logoUrl from './assets/logo.png'
import type { CardData, FichaData } from './types'
import { CardForm } from './components/CardForm'
import { Preview } from './components/Preview'
import { FichaForm } from './components/FichaForm'
import { FichaPreview } from './components/FichaPreview'
import { Toast } from './components/Toast'

type CardCount = 1 | 2 | 3 | 4
type TopTab = 'carteirinha' | 'ficha'

const INITIAL_CARD: CardData = {
  nome: '', dataInicio: '', categoria: '', matricula: '',
  cpf: '', rg: '', endereco: '', foto: null,
}
const INITIAL_FICHA: FichaData = {
  nome: '', cpf: '', rg: '', endereco: '', telefone: '',
  contatoNome: '', contatoTelefone: '', parentesco: '',
}

const CARD_KEY  = 'xango-card-v1'
const FICHA_KEY = 'xango-ficha-v1'

function loadSavedCards(): { count: CardCount; cards: Omit<CardData, 'foto'>[] } | null {
  try { const r = localStorage.getItem(CARD_KEY); return r ? JSON.parse(r) : null } catch { return null }
}
function loadSavedFicha(): FichaData | null {
  try { const r = localStorage.getItem(FICHA_KEY); return r ? JSON.parse(r) : null } catch { return null }
}

function countFilled(data: CardData): number {
  return [data.nome, data.dataInicio, data.categoria, data.matricula, data.cpf, data.rg, data.endereco]
    .filter(v => v.trim() !== '').length
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      style={{ color: '#7A4A1F', opacity: 0.5 }}
      viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M1 1l4 4 4-4" />
    </svg>
  )
}

function Badge({ filled, total }: { filled: number; total: number }) {
  if (filled === 0) return (
    <span className="font-lora text-xs px-2 py-0.5 rounded-full tabular-nums"
      style={{ background: 'rgba(122,74,31,0.08)', color: '#7A4A1F', opacity: 0.6 }}>
      {filled}/{total}
    </span>
  )
  if (filled < total) return (
    <span className="font-lora text-xs px-2 py-0.5 rounded-full tabular-nums"
      style={{ background: 'rgba(212,160,23,0.15)', color: '#96720F' }}>
      {filled}/{total}
    </span>
  )
  return (
    <span className="font-lora text-xs px-2 py-0.5 rounded-full tabular-nums bg-emerald-100 text-emerald-700">
      {filled}/{total}
    </span>
  )
}

export default function App() {
  const [topTab, setTopTab]       = useState<TopTab>('carteirinha')
  const [count, setCount]         = useState<CardCount>(() => loadSavedCards()?.count ?? 1)
  const [cards, setCards]         = useState<CardData[]>(() => {
    const s = loadSavedCards()
    if (!s) return [{ ...INITIAL_CARD }]
    return s.cards.map(c => ({ ...INITIAL_CARD, ...c, foto: null }))
  })
  const [collapsed, setCollapsed] = useState<boolean[]>(() =>
    Array.from({ length: loadSavedCards()?.count ?? 1 }, (_, i) => i > 0),
  )
  const [mobileTab, setMobileTab]             = useState<'form' | 'preview'>('form')
  const [fichaData, setFichaData]             = useState<FichaData>(() => loadSavedFicha() ?? { ...INITIAL_FICHA })
  const [fichaMobileTab, setFichaMobileTab]   = useState<'form' | 'preview'>('form')
  const [toast, setToast]                     = useState(false)

  useEffect(() => {
    try { localStorage.setItem(CARD_KEY, JSON.stringify({ count, cards: cards.map(({ foto: _, ...r }) => r) })) }
    catch { /* ignore */ }
  }, [count, cards])

  useEffect(() => {
    try { localStorage.setItem(FICHA_KEY, JSON.stringify(fichaData)) }
    catch { /* ignore */ }
  }, [fichaData])

  const handleCount = (n: CardCount) => {
    setCount(n)
    setCards(p => n > p.length ? [...p, ...Array.from({ length: n - p.length }, () => ({ ...INITIAL_CARD }))] : p.slice(0, n))
    setCollapsed(p => n > p.length ? [...p, ...Array.from({ length: n - p.length }, () => true)] : p.slice(0, n))
  }
  const handleChange    = useCallback((i: number, d: CardData) => setCards(p => p.map((c, j) => j === i ? d : c)), [])
  const handleDuplicate = useCallback((i: number) => setCards(p => p.map((c, j) => j === i ? { ...(p[i - 1] ?? INITIAL_CARD), foto: null } : c)), [])
  const handleClear     = useCallback((i: number) => setCards(p => p.map((c, j) => j === i ? { ...INITIAL_CARD } : c)), [])
  const toggleCollapse  = (i: number) => setCollapsed(p => p.map((v, j) => j === i ? !v : v))

  return (
    <div className="min-h-screen" style={{ background: '#F6EBDD' }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20" style={{ background: '#3B1F0E' }}>

        {/* Brand row */}
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-3 flex items-center gap-4">
          {/* Logo in beige medallion so the white PNG bg looks intentional */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: '#F6EBDD', border: '1px solid rgba(212,160,23,0.4)' }}>
            <img src={logoUrl} alt="Logo" className="w-9 h-9 object-contain" />
          </div>

          <div className="flex flex-col leading-tight">
            <h1 className="font-cinzel font-semibold uppercase tracking-widest text-sm sm:text-base"
              style={{ color: '#F6EBDD', letterSpacing: '0.12em' }}>
              Centro Espírita Xangô da Pedreira
            </h1>
            <p className="font-playfair italic text-xs mt-0.5" style={{ color: '#D4A017' }}>
              Gerador de Carteiras • Umbanda
            </p>
          </div>
        </div>

        {/* Top tabs */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="max-w-6xl mx-auto px-5 sm:px-8 flex">
            {(['carteirinha', 'ficha'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setTopTab(tab)}
                className="font-cinzel text-xs font-semibold uppercase tracking-widest px-5 py-3 transition-all relative"
                style={{
                  color: topTab === tab ? '#D4A017' : 'rgba(246,235,221,0.45)',
                  borderBottom: topTab === tab ? '2px solid #D4A017' : '2px solid transparent',
                }}
              >
                {tab === 'carteirinha' ? 'Carteirinha' : 'Ficha'}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Carteirinha tab ──────────────────────────────────────────────── */}
      {topTab === 'carteirinha' && (
        <>
          <MobileSubTabs active={mobileTab} onChange={setMobileTab} />

          <main className="max-w-6xl mx-auto px-4 sm:px-8 py-7 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* Form column */}
            <div className={`flex flex-col gap-4 ${mobileTab === 'form' ? 'block' : 'hidden'} lg:block`}>

              {/* Count selector */}
              <div className="rounded-2xl p-5 flex items-center justify-between"
                style={{ background: '#fff', border: '1px solid rgba(122,74,31,0.14)', boxShadow: '0 1px 4px rgba(59,31,14,0.06)' }}>
                <span className="font-lora text-sm" style={{ color: '#3B1F0E' }}>Quantidade de carteirinhas</span>
                <div className="flex gap-2">
                  {([1, 2, 3, 4] as const).map(n => (
                    <button
                      key={n}
                      onClick={() => handleCount(n)}
                      className="w-9 h-9 rounded-lg font-cinzel text-sm font-semibold transition-all"
                      style={count === n
                        ? { background: '#3B1F0E', color: '#F6EBDD', boxShadow: '0 1px 4px rgba(59,31,14,0.25)' }
                        : { background: '#F6EBDD', color: '#7A4A1F', border: '1px solid rgba(122,74,31,0.25)' }
                      }
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card accordion */}
              {cards.map((data, i) => (
                <div key={i} className="rounded-2xl overflow-hidden"
                  style={{ background: '#fff', border: '1px solid rgba(122,74,31,0.14)', boxShadow: '0 1px 4px rgba(59,31,14,0.06)' }}>

                  {/* Accordion header */}
                  <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer select-none transition-colors"
                    style={{ borderBottom: !(collapsed[i] ?? false) ? '1px solid rgba(122,74,31,0.10)' : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(246,235,221,0.5)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                    onClick={() => toggleCollapse(i)}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-cinzel text-sm font-semibold uppercase tracking-wide"
                        style={{ color: '#3B1F0E' }}>
                        {count > 1 ? `Carteirinha ${i + 1}` : 'Dados da Carteirinha'}
                      </span>
                      <Badge filled={countFilled(data)} total={7} />
                    </div>
                    <div className="flex items-center gap-1">
                      {i > 0 && (
                        <button
                          onClick={e => { e.stopPropagation(); handleDuplicate(i) }}
                          className="font-lora text-xs px-2 py-1 rounded-lg transition-colors"
                          style={{ color: 'rgba(122,74,31,0.6)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#F6EBDD'; e.currentTarget.style.color = '#3B1F0E' }}
                          onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(122,74,31,0.6)' }}
                        >
                          Copiar anterior
                        </button>
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); handleClear(i) }}
                        className="font-lora text-xs px-2 py-1 rounded-lg transition-colors"
                        style={{ color: 'rgba(122,74,31,0.5)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626' }}
                        onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(122,74,31,0.5)' }}
                      >
                        Limpar
                      </button>
                      <Chevron open={!(collapsed[i] ?? false)} />
                    </div>
                  </div>

                  {!(collapsed[i] ?? false) && (
                    <div className="px-5 pb-6 pt-5">
                      <CardForm data={data} onChange={d => handleChange(i, d)} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Preview column */}
            <div className={`rounded-2xl p-6 ${mobileTab === 'preview' ? 'block' : 'hidden'} lg:block`}
              style={{ background: '#fff', border: '1px solid rgba(122,74,31,0.14)', boxShadow: '0 1px 4px rgba(59,31,14,0.06)' }}>
              <Preview cards={cards} onDownload={() => setToast(true)} />
            </div>
          </main>
        </>
      )}

      {/* ── Ficha tab ────────────────────────────────────────────────────── */}
      {topTab === 'ficha' && (
        <>
          <MobileSubTabs active={fichaMobileTab} onChange={setFichaMobileTab} />

          <main className="max-w-6xl mx-auto px-4 sm:px-8 py-7 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* Form column */}
            <div className={`rounded-2xl overflow-hidden ${fichaMobileTab === 'form' ? 'block' : 'hidden'} lg:block`}
              style={{ background: '#fff', border: '1px solid rgba(122,74,31,0.14)', boxShadow: '0 1px 4px rgba(59,31,14,0.06)' }}>
              <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(122,74,31,0.10)' }}>
                <span className="font-cinzel text-sm font-semibold uppercase tracking-wide" style={{ color: '#3B1F0E' }}>
                  Dados da Ficha
                </span>
              </div>
              <div className="px-5 pb-6 pt-5">
                <FichaForm data={fichaData} onChange={setFichaData} />
              </div>
            </div>

            {/* Preview column */}
            <div className={`rounded-2xl p-6 ${fichaMobileTab === 'preview' ? 'block' : 'hidden'} lg:block`}
              style={{ background: '#fff', border: '1px solid rgba(122,74,31,0.14)', boxShadow: '0 1px 4px rgba(59,31,14,0.06)' }}>
              <FichaPreview data={fichaData} onDownload={() => setToast(true)} />
            </div>
          </main>
        </>
      )}

      {/* Motto */}
      <footer className="pb-10 pt-2 text-center px-4">
        <p className="font-playfair italic text-xs" style={{ color: 'rgba(122,74,31,0.5)' }}>
          "Fé, caridade e amor. São caminhos que te levam à luz."
        </p>
      </footer>

      <Toast message="PDF gerado com sucesso!" show={toast} onHide={() => setToast(false)} />
    </div>
  )
}

// ── Shared mobile sub-tab bar ──────────────────────────────────────────────
function MobileSubTabs({
  active,
  onChange,
}: {
  active: 'form' | 'preview'
  onChange: (v: 'form' | 'preview') => void
}) {
  return (
    <div className="lg:hidden sticky top-[100px] z-10"
      style={{ background: '#fff', borderBottom: '1px solid rgba(122,74,31,0.12)' }}>
      <div className="flex max-w-6xl mx-auto">
        {(['form', 'preview'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className="flex-1 py-3 font-cinzel text-xs font-semibold uppercase tracking-widest transition-colors"
            style={{
              color: active === tab ? '#3B1F0E' : 'rgba(122,74,31,0.45)',
              borderBottom: active === tab ? '2px solid #D4A017' : '2px solid transparent',
            }}
          >
            {tab === 'form' ? 'Dados' : 'Preview'}
          </button>
        ))}
      </div>
    </div>
  )
}
