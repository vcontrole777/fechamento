
export interface Recebimento {
  id: number;
  id_tripeiro: number;
  id_equipe: number;
  valor: number;
  data: string;
  observacoes?: string;
  criado_em: string;
  atualizado_em: string;
  tripeiro?: {
    id: number;
    nome: string;
    porcentagem: number;
  };
}

export interface NewRecebimento {
  id_tripeiro: number;
  valor: number;
  data: string;
  observacoes?: string;
}

export interface UpdateRecebimento {
  id_tripeiro?: number;
  valor?: number;
  data?: string;
  observacoes?: string;
}
