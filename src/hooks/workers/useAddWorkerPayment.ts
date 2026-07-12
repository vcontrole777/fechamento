import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { WorkerType, paymentTableFor, workerIdColumnFor, derivePaymentStatus } from "./workerConfig";
import { WorkerPaymentInput } from "@/types/workerPayment.types";

export function useAddWorkerPayment(tipo: WorkerType) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: WorkerPaymentInput) => {
      const status = derivePaymentStatus(input.valor_pago, input.valor_devido);

      const { data, error } = await supabase
        .from(paymentTableFor(tipo))
        .insert({
          [workerIdColumnFor(tipo)]: input.workerId,
          id_equipe: input.id_equipe,
          valor_devido: input.valor_devido,
          valor_pago: input.valor_pago,
          data_pagamento: input.data_pagamento,
          periodo_inicio: input.periodo_inicio,
          periodo_fim: input.periodo_fim,
          metodo_pagamento: input.metodo_pagamento,
          observacoes: input.observacoes || null,
          status,
          criado_por: user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error(`Error adding ${tipo} payment:`, error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker-payments", tipo] });
      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi registrado com sucesso.",
      });
    },
    onError: (error) => {
      console.error(`Error adding ${tipo} payment:`, error);
      toast({
        title: "Erro ao registrar pagamento",
        description: "Não foi possível registrar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}
