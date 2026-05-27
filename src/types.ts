export interface CardData {
  nome: string
  dataInicio: string
  categoria: string
  matricula: string
  cpf: string
  rg: string
  endereco: string
  foto: File | null
}

export interface FichaData {
  nome: string
  cpf: string
  rg: string
  endereco: string
  telefone: string
  contatoNome: string
  contatoTelefone: string
  parentesco: string
}

export interface PagamentoData {
  nome: string
  matricula: string
  categoria: string
}
