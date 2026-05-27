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
  foto: File | null
  contatoNome1: string
  contatoTelefone1: string
  parentesco1: string
  contatoNome2: string
  contatoTelefone2: string
  parentesco2: string
}

export interface PagamentoData {
  nome: string
  matricula: string
  categoria: string
}
