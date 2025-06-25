
import { z } from "zod";

export const recebimentoFormSchema = z.object({
  id_tripeiro: z.number().min(1, "Selecione um tripeiro"),
  valor: z.number().min(0.01, "O valor deve ser maior que zero"),
  data: z.string().min(1, "A data é obrigatória"),
  observacoes: z.string().optional(),
  conta_depositada: z.string().optional(),
  numero_comprovante: z.string().optional(),
  banco: z.string().optional(),
  tipo_deposito: z.enum(["deposito", "pix", "especie"]).optional(),
  valor_em_massa: z.boolean().optional(),
  quantidade_recebimentos: z.number().min(1, "Quantidade deve ser maior que zero").optional(),
});

export type RecebimentoFormData = z.infer<typeof recebimentoFormSchema>;
