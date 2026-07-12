import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveTeamId } from "@/hooks/useEffectiveTeamId";

export function useTripeiroStats() {
  const teamId = useEffectiveTeamId();

  return useQuery({
    queryKey: ['tripeiro-stats', teamId],
    queryFn: async () => {
      // Get total tripeiros
      const { data: tripeiros } = await supabase
        .from('pessoas')
        .select('id')
        .eq('id_equipe', teamId)
        .eq('tipo', 'tripeiro');

      // Get total paid to tripeiros
      const { data: payments } = await supabase
        .from('pagamentos_tripeiros')
        .select('valor_pago')
        .eq('id_equipe', teamId);

      // Get pending payments
      const { data: pendingPayments } = await supabase
        .from('pagamentos_tripeiros')
        .select('valor_devido, valor_pago')
        .eq('id_equipe', teamId)
        .neq('status', 'pago_total');

      const totalPaid = payments?.reduce((sum, p) => sum + Number(p.valor_pago), 0) || 0;
      const totalPending = pendingPayments?.reduce((sum, p) =>
        sum + (Number(p.valor_devido) - Number(p.valor_pago)), 0) || 0;

      return {
        totalTripeiros: tripeiros?.length || 0,
        totalPaid: totalPaid,
        totalPending: totalPending,
        totalPayments: payments?.length || 0,
      };
    },
    enabled: !!teamId,
  });
}
