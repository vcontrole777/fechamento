import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

type AddAttendantPaymentParams = {
  id_atendente: number;
  id_equipe: number;
  valor_comissao: number;
  valor_pago: number;
  data_pagamento: Date;
  periodo_inicio: Date;
  periodo_fim: Date;
  metodo_pagamento: 'dinheiro' | 'pix' | 'transferencia' | 'outro';
  observacoes?: string;
};

export function useAddAttendantPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddAttendantPaymentParams) => {
      // Calculate status based on payment amount vs commission
      let status: 'pendente' | 'pago_parcial' | 'pago_total';
      if (params.valor_pago === 0) {
        status = 'pendente';
      } else if (params.valor_pago < params.valor_comissao) {
        status = 'pago_parcial';
      } else {
        status = 'pago_total';
      }

      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('pagamentos_atendentes')
        .insert({
          id_atendente: params.id_atendente,
          id_equipe: params.id_equipe,
          valor_comissao: params.valor_comissao,
          valor_pago: params.valor_pago,
          data_pagamento: format(params.data_pagamento, 'yyyy-MM-dd'),
          periodo_inicio: format(params.periodo_inicio, 'yyyy-MM-dd'),
          periodo_fim: format(params.periodo_fim, 'yyyy-MM-dd'),
          metodo_pagamento: params.metodo_pagamento,
          observacoes: params.observacoes || null,
          status,
          criado_por: userData.user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding attendant payment:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendant-payments'] });
      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi registrado com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error adding attendant payment:', error);
      toast({
        title: "Erro ao registrar pagamento",
        description: "Não foi possível registrar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}
