import { z } from "zod";

export const attendantPaymentSchema = z.object({
  valor_pago: z.coerce.number()
    .positive("Valor deve ser maior que zero")
    .min(0.01, "Valor mínimo é R$ 0,01"),
  data_pagamento: z.date({
    required_error: "Data é obrigatória"
  }).max(new Date(), "Data não pode ser futura"),
  metodo_pagamento: z.enum(['dinheiro', 'pix', 'transferencia', 'outro'], {
    required_error: "Método de pagamento é obrigatório"
  }),
  observacoes: z.string().max(500, "Observações devem ter no máximo 500 caracteres").optional()
});

export type AttendantPaymentFormData = z.infer<typeof attendantPaymentSchema>;
