import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useAttendantStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['attendant-stats', user?.id],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id_equipe')
        .eq('id', user?.id)
        .single();

      if (!profile?.id_equipe) {
        throw new Error('Equipe não encontrada');
      }

      // Get total attendants
      const { data: attendants } = await supabase
        .from('pessoas')
        .select('id')
        .eq('id_equipe', profile.id_equipe)
        .eq('tipo', 'atendente');

      // Get total commissions paid
      const { data: payments } = await supabase
        .from('pagamentos_atendentes')
        .select('valor_pago')
        .eq('id_equipe', profile.id_equipe);

      // Get pending commissions
      const { data: pendingPayments } = await supabase
        .from('pagamentos_atendentes')
        .select('valor_comissao, valor_pago')
        .eq('id_equipe', profile.id_equipe)
        .neq('status', 'pago_total');

      const totalPaid = payments?.reduce((sum, p) => sum + Number(p.valor_pago), 0) || 0;
      const totalPending = pendingPayments?.reduce((sum, p) => 
        sum + (Number(p.valor_comissao) - Number(p.valor_pago)), 0) || 0;

      return {
        totalAttendants: attendants?.length || 0,
        totalCommissionsPaid: totalPaid,
        totalCommissionsPending: totalPending,
        totalPayments: payments?.length || 0,
      };
    },
    enabled: !!user?.id,
  });
}
