import { z } from "zod";

export const tripeiroPaymentSchema = z.object({
  valor_pago: z.number({
    required_error: "Valor é obrigatório",
    invalid_type_error: "Valor deve ser um número",
  }).positive("Valor deve ser maior que zero"),
  
  data_pagamento: z.string({
    required_error: "Data é obrigatória",
  }),
  
  metodo_pagamento: z.enum(["dinheiro", "pix", "deposito", "transferencia", "outro"], {
    required_error: "Método de pagamento é obrigatório",
  }),
  
  observacoes: z.string().optional(),
});

export type TripeiroPaymentFormData = z.infer<typeof tripeiroPaymentSchema>;
