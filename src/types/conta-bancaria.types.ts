
export interface ContaBancaria {
  id: number;
  banco: string;
  agencia: string;
  conta: string;
  nome: string;
  id_equipe: number;
  criado_em: string;
  atualizado_em: string;
}

export interface NewContaBancaria {
  banco: string;
  agencia: string;
  conta: string;
  nome: string;
}

export interface UpdateContaBancaria {
  banco?: string;
  agencia?: string;
  conta?: string;
  nome?: string;
}
