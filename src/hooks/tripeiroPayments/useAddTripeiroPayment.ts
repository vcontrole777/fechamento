import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface AddTripeiroPaymentData {
  id_tripeiro: number;
  id_equipe: number;
  data_pagamento: string;
  periodo_inicio: string;
  periodo_fim: string;
  valor_a_receber: number;
  valor_pago: number;
  metodo_pagamento: 'dinheiro' | 'pix' | 'transferencia' | 'outros';
  observacoes?: string;
}

export function useAddTripeiroPayment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: AddTripeiroPaymentData) => {
      // Determinar o status baseado nos valores
      let status: 'pendente' | 'parcialmente_pago' | 'pago' = 'pendente';
      
      if (data.valor_pago >= data.valor_a_receber) {
        status = 'pago';
      } else if (data.valor_pago > 0) {
        status = 'parcialmente_pago';
      }

      const { data: payment, error } = await supabase
        .from("pagamentos_tripeiros")
        .insert([{
          ...data,
          status,
          criado_por: user?.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripeiro-payments"] });
      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi registrado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error adding tripeiro payment:", error);
      toast({
        title: "Erro ao registrar pagamento",
        description: "Ocorreu um erro ao registrar o pagamento.",
        variant: "destructive",
      });
    },
  });
}
