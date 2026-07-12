export type WorkerPayment = {
  id: string;
  id_equipe: number;
  workerId: number;
  valor_devido: number;
  valor_pago: number;
  data_pagamento: string;
  periodo_inicio: string;
  periodo_fim: string;
  metodo_pagamento: "dinheiro" | "pix" | "deposito" | "transferencia" | "outro";
  observacoes?: string | null;
  status: "pendente" | "pago_parcial" | "pago_total";
  criado_em: string;
  atualizado_em: string;
  criado_por?: string | null;
};

export type WorkerPaymentInput = {
  workerId: number;
  id_equipe: number;
  valor_devido: number;
  valor_pago: number;
  data_pagamento: string;
  periodo_inicio: string;
  periodo_fim: string;
  metodo_pagamento: WorkerPayment["metodo_pagamento"];
  observacoes?: string;
};
