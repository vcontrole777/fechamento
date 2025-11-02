import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

type UpdateAttendantPaymentParams = {
  id: string;
  valor_comissao: number;
  valor_pago: number;
  data_pagamento: Date;
  metodo_pagamento: 'dinheiro' | 'pix' | 'transferencia' | 'outro';
  observacoes?: string;
};

export function useUpdateAttendantPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateAttendantPaymentParams) => {
      // Calculate status based on payment amount vs commission
      let status: 'pendente' | 'pago_parcial' | 'pago_total';
      if (params.valor_pago === 0) {
        status = 'pendente';
      } else if (params.valor_pago < params.valor_comissao) {
        status = 'pago_parcial';
      } else {
        status = 'pago_total';
      }

      const { data, error } = await supabase
        .from('pagamentos_atendentes')
        .update({
          valor_pago: params.valor_pago,
          data_pagamento: format(params.data_pagamento, 'yyyy-MM-dd'),
          metodo_pagamento: params.metodo_pagamento,
          observacoes: params.observacoes || null,
          status,
        })
        .eq('id', params.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating attendant payment:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendant-payments'] });
      toast({
        title: "Pagamento atualizado",
        description: "O pagamento foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error updating attendant payment:', error);
      toast({
        title: "Erro ao atualizar pagamento",
        description: "Não foi possível atualizar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}
