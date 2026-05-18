import { useState, useCallback, useEffect } from 'react'
import type { CardData } from './types'
import { CardForm } from './components/CardForm'
import { Preview } from './components/Preview'
import { Toast } from './components/Toast'

type CardCount = 1 | 2 | 3 | 4

const INITIAL: CardData = {
  nome: '', dataInicio: '', categoria: '', matricula: '',
  cpf: '', rg: '', endereco: '', foto: null,
}

const STORAGE_KEY = 'xango-card-v1'

function loadSaved(): { count: CardCount; cards: Omit<CardData, 'foto'>[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as { count: CardCount; cards: Omit<CardData, 'foto'>[] }) : null
  } catch { return null }
}

function countFilled(data: CardData): number {
  return [data.nome, data.dataInicio, data.categoria, data.matricula, data.cpf, data.rg, data.endereco]
    .filter(v => v.trim() !== '').length
}

// ─── Chevron icon ─────────────────────────────────────────────────────────────
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M1 1l4 4 4-4" />
    </svg>
  )
}

// ─── Completion badge ─────────────────────────────────────────────────────────
function Badge({ filled, total }: { filled: number; total: number }) {
  const cls =
    filled === 0   ? 'bg-stone-100 text-stone-400'
    : filled < total ? 'bg-amber-100 text-amber-700'
    :                  'bg-emerald-100 text-emerald-700'
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums ${cls}`}>
      {filled}/{total}
    </span>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [count, setCount] = useState<CardCount>(() => loadSaved()?.count ?? 1)
  const [cards, setCards] = useState<CardData[]>(() => {
    const s = loadSaved()
    if (!s) return [{ ...INITIAL }]
    return s.cards.map(c => ({ ...INITIAL, ...c, foto: null }))
  })
  const [collapsed, setCollapsed] = useState<boolean[]>(() =>
    Array.from({ length: loadSaved()?.count ?? 1 }, (_, i) => i > 0),
  )
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form')
  const [toast, setToast] = useState(false)

  // Persist text fields to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          count,
          cards: cards.map(({ foto: _foto, ...rest }) => rest),
        }),
      )
    } catch { /* ignore quota errors */ }
  }, [count, cards])

  const handleCount = (n: CardCount) => {
    setCount(n)
    setCards(prev =>
      n > prev.length
        ? [...prev, ...Array.from({ length: n - prev.length }, () => ({ ...INITIAL }))]
        : prev.slice(0, n),
    )
    setCollapsed(prev =>
      n > prev.length
        ? [...prev, ...Array.from({ length: n - prev.length }, () => true)]
        : prev.slice(0, n),
    )
  }

  const handleChange = useCallback((index: number, data: CardData) => {
    setCards(prev => prev.map((c, i) => (i === index ? data : c)))
  }, [])

  // Copy all text fields from the previous card into this one
  const handleDuplicate = useCallback((index: number) => {
    setCards(prev =>
      prev.map((c, i) => i === index ? { ...(prev[index - 1] ?? INITIAL), foto: null } : c),
    )
  }, [])

  const handleClear = useCallback((index: number) => {
    setCards(prev => prev.map((c, i) => (i === index ? { ...INITIAL } : c)))
  }, [])

  const toggleCollapse = (index: number) => {
    setCollapsed(prev => prev.map((v, i) => (i === index ? !v : v)))
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-6 py-4 sticky top-0 z-20">
        <h1 className="text-lg font-semibold text-stone-900">Gerador de Carteirinha</h1>
        <p className="text-sm text-stone-400">Centro Espírita Xangô da Pedreira</p>
      </header>

      {/* Mobile tab bar */}
      <div className="lg:hidden sticky top-[65px] z-10 bg-white border-b border-stone-200">
        <div className="flex">
          {(['form', 'preview'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                mobileTab === tab
                  ? 'text-stone-900 border-b-2 border-stone-800'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {tab === 'form' ? 'Dados' : 'Preview'}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ── Form column ─────────────────────────────────────────────────── */}
        <div className={`flex flex-col gap-4 ${mobileTab === 'form' ? 'block' : 'hidden'} lg:block`}>
          {/* Count selector */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm px-5 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-stone-700">Quantidade de carteirinhas</span>
            <div className="flex gap-1.5">
              {([1, 2, 3, 4] as const).map(n => (
                <button
                  key={n}
                  onClick={() => handleCount(n)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                    count === n
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Card forms — accordion */}
          {cards.map((data, i) => {
            const filled   = countFilled(data)
            const isOpen   = !(collapsed[i] ?? false)
            return (
              <div key={i} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                {/* Accordion header */}
                <div
                  className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-stone-50 transition-colors select-none"
                  onClick={() => toggleCollapse(i)}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-stone-700">
                      {count > 1 ? `Carteirinha ${i + 1}` : 'Dados da Carteirinha'}
                    </span>
                    <Badge filled={filled} total={7} />
                  </div>
                  <div className="flex items-center gap-1">
                    {i > 0 && (
                      <button
                        onClick={e => { e.stopPropagation(); handleDuplicate(i) }}
                        className="text-xs text-stone-400 hover:text-stone-700 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors"
                        title="Copiar dados da carteirinha anterior"
                      >
                        Copiar anterior
                      </button>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); handleClear(i) }}
                      className="text-xs text-stone-400 hover:text-red-500 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      title="Limpar todos os campos"
                    >
                      Limpar
                    </button>
                    <Chevron open={isOpen} />
                  </div>
                </div>

                {/* Form body */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 border-t border-stone-100">
                    <CardForm data={data} onChange={d => handleChange(i, d)} />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Preview column ───────────────────────────────────────────────── */}
        <div className={`bg-white rounded-2xl border border-stone-200 shadow-sm p-6 ${mobileTab === 'preview' ? 'block' : 'hidden'} lg:block`}>
          <Preview cards={cards} onDownload={() => setToast(true)} />
        </div>
      </main>

      <Toast message="PDF gerado com sucesso!" show={toast} onHide={() => setToast(false)} />
    </div>
  )
}
