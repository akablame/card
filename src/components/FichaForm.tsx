import { useRef, useState, useEffect, type ChangeEvent } from 'react'
import type { FichaData } from '../types'

interface Props {
  data: FichaData
  onChange: (data: FichaData) => void
}

function maskCPF(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function FichaForm({ data, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging]     = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!data.foto) { setPreviewUrl(null); return }
    const url = URL.createObjectURL(data.foto)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [data.foto])

  const set = (key: keyof Omit<FichaData, 'foto'>) => (e: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...data, [key]: e.target.value })

  const setCPF = (e: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...data, cpf: maskCPF(e.target.value) })

  const setPhone = (key: 'telefone' | 'contatoTelefone1' | 'contatoTelefone2') =>
    (e: ChangeEvent<HTMLInputElement>) =>
      onChange({ ...data, [key]: maskPhone(e.target.value) })

  const applyFile = (file: File | undefined) => {
    if (file?.type.startsWith('image/')) onChange({ ...data, foto: file })
  }

  return (
    <div className="flex flex-col gap-5">
      <Section label="Dados Pessoais">
        <Field label="Nome completo" value={data.nome}     onChange={set('nome')} />
        <Field label="CPF"           value={data.cpf}      onChange={setCPF}             placeholder="000.000.000-00" />
        <Field label="RG"            value={data.rg}       onChange={set('rg')} />
        <Field label="Endereço"      value={data.endereco} onChange={set('endereco')} />
        <Field label="Telefone"      value={data.telefone} onChange={setPhone('telefone')} placeholder="(00) 00000-0000" />

        <div className="flex flex-col gap-1.5">
          <label className="font-lora text-sm" style={{ color: '#7A4A1F' }}>Foto 3x4</label>
          <div
            onDragOver={e  => { e.preventDefault(); setDragging(true)  }}
            onDragEnter={e => { e.preventDefault(); setDragging(true)  }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); applyFile(e.dataTransfer.files[0]) }}
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-xl transition-all select-none"
            style={{
              border: dragging ? '2px dashed #D4A017' : '2px dashed rgba(122,74,31,0.25)',
              background: dragging ? 'rgba(212,160,23,0.05)' : previewUrl ? '#fff' : 'rgba(246,235,221,0.4)',
            }}
          >
            {previewUrl ? (
              <div className="flex items-center gap-3 p-3">
                <img src={previewUrl} alt="Foto" className="w-14 rounded-lg flex-shrink-0 object-cover" style={{ height: '4.5rem' }} />
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="font-lora text-sm font-semibold truncate" style={{ color: '#3B1F0E' }}>{data.foto?.name}</span>
                  <span className="font-lora text-xs italic" style={{ color: 'rgba(122,74,31,0.55)' }}>Clique para trocar</span>
                </div>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onChange({ ...data, foto: null }) }}
                  className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                  style={{ color: 'rgba(122,74,31,0.35)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626' }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'rgba(122,74,31,0.35)' }}
                >
                  <XIcon />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-7 gap-2">
                <UploadIcon />
                <p className="font-lora text-sm text-center px-4" style={{ color: 'rgba(122,74,31,0.55)' }}>
                  Arraste uma foto ou{' '}
                  <span className="font-semibold not-italic" style={{ color: '#3B1F0E' }}>clique para selecionar</span>
                </p>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={e => applyFile(e.target.files?.[0])} />
        </div>
      </Section>

      <Section label="Contato de Emergência 1">
        <Field label="Nome"       value={data.contatoNome1}     onChange={set('contatoNome1')} />
        <Field label="Telefone"   value={data.contatoTelefone1} onChange={setPhone('contatoTelefone1')} placeholder="(00) 00000-0000" />
        <Field label="Parentesco" value={data.parentesco1}      onChange={set('parentesco1')} placeholder="Ex: Mãe, Irmão" />
      </Section>

      <Section label="Contato de Emergência 2">
        <Field label="Nome"       value={data.contatoNome2}     onChange={set('contatoNome2')} />
        <Field label="Telefone"   value={data.contatoTelefone2} onChange={setPhone('contatoTelefone2')} placeholder="(00) 00000-0000" />
        <Field label="Parentesco" value={data.parentesco2}      onChange={set('parentesco2')} placeholder="Ex: Pai, Irmão" />
      </Section>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3.5 rounded-xl p-4"
      style={{ border: '1px solid rgba(122,74,31,0.18)' }}>
      <legend className="font-cinzel text-xs font-semibold uppercase tracking-widest px-1.5"
        style={{ color: '#3B1F0E' }}>
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
  placeholder?: string
}

function Field({ label, value, onChange, placeholder }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-lora text-sm" style={{ color: '#7A4A1F' }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="font-lora text-sm rounded-lg px-3 py-2.5 w-full transition-shadow"
        style={{
          border: '1px solid rgba(122,74,31,0.25)',
          background: '#fff',
          color: '#3B1F0E',
        }}
        onFocus={e => { e.currentTarget.style.outline = 'none'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(212,160,23,0.5)'; e.currentTarget.style.borderColor = '#D4A017' }}
        onBlur={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = 'rgba(122,74,31,0.25)' }}
      />
    </div>
  )
}

function UploadIcon() {
  return (
    <svg className="w-7 h-7" style={{ color: 'rgba(122,74,31,0.3)' }} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
