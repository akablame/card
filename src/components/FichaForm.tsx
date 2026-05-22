import { type ChangeEvent } from 'react'
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
  const set = (key: keyof FichaData) => (e: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...data, [key]: e.target.value })

  const setCPF = (e: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...data, cpf: maskCPF(e.target.value) })

  const setPhone = (key: 'telefone' | 'contatoTelefone') =>
    (e: ChangeEvent<HTMLInputElement>) =>
      onChange({ ...data, [key]: maskPhone(e.target.value) })

  return (
    <div className="flex flex-col gap-5">
      <Section label="Dados Pessoais">
        <Field label="Nome completo" value={data.nome}     onChange={set('nome')} />
        <Field label="CPF"           value={data.cpf}      onChange={setCPF}             placeholder="000.000.000-00" />
        <Field label="RG"            value={data.rg}       onChange={set('rg')} />
        <Field label="Endereço"      value={data.endereco} onChange={set('endereco')} />
        <Field label="Telefone"      value={data.telefone} onChange={setPhone('telefone')} placeholder="(00) 00000-0000" />
      </Section>

      <Section label="Contato de Emergência">
        <Field label="Nome"       value={data.contatoNome}     onChange={set('contatoNome')} />
        <Field label="Telefone"   value={data.contatoTelefone} onChange={setPhone('contatoTelefone')} placeholder="(00) 00000-0000" />
        <Field label="Parentesco" value={data.parentesco}      onChange={set('parentesco')} placeholder="Ex: Mãe, Irmão" />
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
