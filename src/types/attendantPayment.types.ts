export type AttendantPayment = {
  id: string;
  id_atendente: number;
  id_equipe: number;
  valor_comissao: number;
  valor_pago: number;
  data_pagamento: string;
  periodo_inicio: string;
  periodo_fim: string;
  metodo_pagamento: 'dinheiro' | 'pix' | 'transferencia' | 'outro';
  observacoes?: string | null;
  status: 'pendente' | 'pago_parcial' | 'pago_total';
  criado_em: string;
  atualizado_em: string;
  criado_por?: string | null;
  atendente?: {
    id: number;
    nome: string;
  };
};

export type AttendantPaymentFormValues = {
  valor_pago: number;
  data_pagamento: Date;
  metodo_pagamento: 'dinheiro' | 'pix' | 'transferencia' | 'outro';
  observacoes?: string;
};
