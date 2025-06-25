
import { z } from "zod";

export const contaBancariaFormSchema = z.object({
  banco: z.string().min(1, "O banco é obrigatório"),
  agencia: z.string().min(1, "A agência é obrigatória"),
  conta: z.string().min(1, "A conta é obrigatória"),
  nome: z.string().min(1, "O nome da conta é obrigatório"),
});

export type ContaBancariaFormData = z.infer<typeof contaBancariaFormSchema>;
