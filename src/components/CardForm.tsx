import { useRef, useState, useEffect, type ChangeEvent } from 'react'
import type { CardData } from '../types'

interface Props {
  data: CardData
  onChange: (data: CardData) => void
}

function maskCPF(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

export function CardForm({ data, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!data.foto) { setPreviewUrl(null); return }
    const url = URL.createObjectURL(data.foto)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [data.foto])

  const set =
    (key: keyof Omit<CardData, 'foto'>) =>
    (e: ChangeEvent<HTMLInputElement>) =>
      onChange({ ...data, [key]: e.target.value })

  const setCPF = (e: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...data, cpf: maskCPF(e.target.value) })

  const applyFile = (file: File | undefined) => {
    if (file?.type.startsWith('image/')) onChange({ ...data, foto: file })
  }

  return (
    <div className="flex flex-col gap-5">
      <Section label="Frente">
        <Field label="Nome completo"  value={data.nome}       onChange={set('nome')} />
        <Field label="Data de início" value={data.dataInicio} onChange={set('dataInicio')} type="date" />
        <Field label="Categoria"      value={data.categoria}  onChange={set('categoria')}  placeholder="Ex: Médium" />
        <Field label="Matrícula"      value={data.matricula}  onChange={set('matricula')} />

        {/* Photo drag-and-drop zone */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-stone-600">Foto</label>
          <div
            onDragOver={e  => { e.preventDefault(); setDragging(true)  }}
            onDragEnter={e => { e.preventDefault(); setDragging(true)  }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault()
              setDragging(false)
              applyFile(e.dataTransfer.files[0])
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed transition-all select-none ${
              dragging
                ? 'border-stone-500 bg-stone-50 scale-[1.01]'
                : previewUrl
                ? 'border-stone-200 hover:border-stone-400'
                : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50'
            }`}
          >
            {previewUrl ? (
              <div className="flex items-center gap-3 p-3">
                <img
                  src={previewUrl}
                  alt="Foto selecionada"
                  className="w-14 object-cover rounded-lg flex-shrink-0"
                  style={{ height: '4.5rem' }}
                />
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-sm font-medium text-stone-700 truncate">
                    {data.foto?.name}
                  </span>
                  <span className="text-xs text-stone-400">Clique para trocar</span>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onChange({ ...data, foto: null }) }}
                  className="text-stone-300 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 flex-shrink-0"
                  title="Remover foto"
                  type="button"
                >
                  <XIcon />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 gap-2 text-center px-4">
                <UploadIcon />
                <p className="text-sm text-stone-400 leading-snug">
                  Arraste uma foto ou{' '}
                  <span className="text-stone-600 font-medium">clique para selecionar</span>
                </p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => applyFile(e.target.files?.[0])}
          />
        </div>
      </Section>

      <Section label="Verso">
        <Field label="CPF"      value={data.cpf}      onChange={setCPF}         placeholder="000.000.000-00" />
        <Field label="RG"       value={data.rg}       onChange={set('rg')} />
        <Field label="Endereço" value={data.endereco} onChange={set('endereco')} />
      </Section>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3 border border-stone-200 rounded-xl p-4">
      <legend className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-1">
        {label}
      </legend>
      {children}
    </fieldset>
  )
}

interface FieldProps {
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
}

function Field({ label, value, onChange, type = 'text', placeholder }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-stone-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-shadow"
      />
    </div>
  )
}

function UploadIcon() {
  return (
    <svg className="w-7 h-7 text-stone-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
