
import { z } from "zod";

export const paymentFormSchema = z.object({
  data: z.date({
    required_error: "A data é obrigatória.",
  }),
  valor: z.coerce.number().positive({
    message: "O valor deve ser maior que zero.",
  }),
  id_atendente: z.string().optional(),
  id_tripeiro: z.string().optional(),
  tipo: z.enum(["boleto", "pix"], {
    required_error: "O tipo de pagamento é obrigatório.",
  }),
  status: z.enum(["concluido", "pendente", "bloqueado"], {
    required_error: "O status é obrigatório.",
  }).default("pendente"),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
