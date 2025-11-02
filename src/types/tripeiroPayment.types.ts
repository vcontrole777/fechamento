export interface TripeiroPayment {
  id: string;
  id_tripeiro: number;
  id_equipe: number;
  data_pagamento: string;
  periodo_inicio: string;
  periodo_fim: string;
  valor_a_receber: number;
  valor_pago: number;
  metodo_pagamento: 'dinheiro' | 'pix' | 'transferencia' | 'outros';
  status: 'pendente' | 'pago_parcial' | 'pago_total';
  observacoes?: string;
  criado_por?: string;
  criado_em: string;
  atualizado_em: string;
  tripeiro?: {
    id: number;
    nome: string;
  };
}

export interface TripeiroPaymentFormValues {
  valor_pago: number;
  data_pagamento: string;
  metodo_pagamento: 'dinheiro' | 'pix' | 'transferencia' | 'outros';
  observacoes?: string;
}
