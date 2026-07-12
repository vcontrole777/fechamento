import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveTeamId } from "@/hooks/useEffectiveTeamId";

export function useAttendantStats() {
  const teamId = useEffectiveTeamId();

  return useQuery({
    queryKey: ['attendant-stats', teamId],
    queryFn: async () => {
      // Get total attendants
      const { data: attendants } = await supabase
        .from('pessoas')
        .select('id')
        .eq('id_equipe', teamId)
        .eq('tipo', 'atendente');

      // Get total commissions paid
      const { data: payments } = await supabase
        .from('pagamentos_atendentes')
        .select('valor_pago')
        .eq('id_equipe', teamId);

      // Get pending commissions
      const { data: pendingPayments } = await supabase
        .from('pagamentos_atendentes')
        .select('valor_devido, valor_pago')
        .eq('id_equipe', teamId)
        .neq('status', 'pago_total');

      const totalPaid = payments?.reduce((sum, p) => sum + Number(p.valor_pago), 0) || 0;
      const totalPending = pendingPayments?.reduce((sum, p) =>
        sum + (Number(p.valor_devido) - Number(p.valor_pago)), 0) || 0;

      return {
        totalAttendants: attendants?.length || 0,
        totalCommissionsPaid: totalPaid,
        totalCommissionsPending: totalPending,
        totalPayments: payments?.length || 0,
      };
    },
    enabled: !!teamId,
  });
}
