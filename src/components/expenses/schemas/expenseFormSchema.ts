
import { z } from "zod";

export const expenseFormSchema = z.object({
  descricao: z.string().min(3, {
    message: "A descrição deve ter pelo menos 3 caracteres.",
  }),
  valor: z.coerce.number().positive({
    message: "O valor deve ser maior que zero.",
  }),
  data: z.date({
    required_error: "A data é obrigatória.",
  }),
  id_responsavel: z.number().optional(),
  categoria: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
