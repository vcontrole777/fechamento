
import { z } from "zod";

export const recebimentoFormSchema = z.object({
  id_tripeiro: z.number().min(1, "Selecione um tripeiro"),
  valor: z.number().min(0.01, "O valor deve ser maior que zero"),
  data: z.string().min(1, "A data é obrigatória"),
  observacoes: z.string().optional(),
});

export type RecebimentoFormData = z.infer<typeof recebimentoFormSchema>;
