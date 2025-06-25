
export interface Recebimento {
  id: number;
  id_tripeiro: number;
  id_equipe: number;
  valor: number;
  data: string;
  observacoes?: string;
  conta_depositada?: string;
  numero_comprovante?: string;
  banco?: string;
  tipo_deposito?: string;
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
  conta_depositada?: string;
  numero_comprovante?: string;
  banco?: string;
  tipo_deposito?: string;
}

export interface UpdateRecebimento {
  id_tripeiro?: number;
  valor?: number;
  data?: string;
  observacoes?: string;
  conta_depositada?: string;
  numero_comprovante?: string;
  banco?: string;
  tipo_deposito?: string;
}
