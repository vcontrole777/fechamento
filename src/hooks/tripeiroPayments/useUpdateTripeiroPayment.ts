import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface UpdateTripeiroPaymentData {
  id: string;
  valor_pago: number;
  data_pagamento: string;
  metodo_pagamento: 'dinheiro' | 'pix' | 'deposito' | 'transferencia' | 'outros';
  observacoes?: string;
  valor_a_receber: number;
}

export function useUpdateTripeiroPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, valor_a_receber, ...data }: UpdateTripeiroPaymentData) => {
      // Determinar o status baseado nos valores
      let status: 'pendente' | 'pago_parcial' | 'pago_total' = 'pendente';
      
      if (data.valor_pago >= valor_a_receber) {
        status = 'pago_total';
      } else if (data.valor_pago > 0) {
        status = 'pago_parcial';
      }

      const { data: payment, error } = await supabase
        .from("pagamentos_tripeiros")
        .update({ ...data, status })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripeiro-payments"] });
      toast({
        title: "Pagamento atualizado",
        description: "O pagamento foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error updating tripeiro payment:", error);
      toast({
        title: "Erro ao atualizar pagamento",
        description: "Ocorreu um erro ao atualizar o pagamento.",
        variant: "destructive",
      });
    },
  });
}
