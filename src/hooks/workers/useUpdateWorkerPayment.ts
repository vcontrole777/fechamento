import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { WorkerType, paymentTableFor, derivePaymentStatus } from "./workerConfig";
import { WorkerPayment } from "@/types/workerPayment.types";

export type UpdateWorkerPaymentParams = {
  id: string;
  valor_devido: number;
  valor_pago: number;
  data_pagamento: string;
  metodo_pagamento: WorkerPayment["metodo_pagamento"];
  observacoes?: string;
};

export function useUpdateWorkerPayment(tipo: WorkerType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateWorkerPaymentParams) => {
      const status = derivePaymentStatus(params.valor_pago, params.valor_devido);

      const { data, error } = await supabase
        .from(paymentTableFor(tipo))
        .update({
          valor_pago: params.valor_pago,
          data_pagamento: params.data_pagamento,
          metodo_pagamento: params.metodo_pagamento,
          observacoes: params.observacoes || null,
          status,
        })
        .eq("id", params.id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating ${tipo} payment:`, error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker-payments", tipo] });
      toast({
        title: "Pagamento atualizado",
        description: "O pagamento foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error(`Error updating ${tipo} payment:`, error);
      toast({
        title: "Erro ao atualizar pagamento",
        description: "Não foi possível atualizar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}
