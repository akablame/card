import { type ChangeEvent } from 'react'
import type { PagamentoData } from '../types'

interface Props {
  data: PagamentoData
  onChange: (data: PagamentoData) => void
}

export function PagamentoForm({ data, onChange }: Props) {
  const set = (key: keyof PagamentoData) => (e: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...data, [key]: e.target.value })

  return (
    <div className="flex flex-col gap-5">
      <Section label="Frente">
        <Field label="Nome completo" value={data.nome} onChange={set('nome')} />
        <Field label="Matrícula"     value={data.matricula} onChange={set('matricula')} />
        <Field label="Categoria"     value={data.categoria} onChange={set('categoria')} placeholder="Ex: Médium" />
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
