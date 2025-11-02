import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useTripeiroStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['tripeiro-stats', user?.id],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id_equipe')
        .eq('id', user?.id)
        .single();

      if (!profile?.id_equipe) {
        throw new Error('Equipe não encontrada');
      }

      // Get total tripeiros
      const { data: tripeiros } = await supabase
        .from('pessoas')
        .select('id')
        .eq('id_equipe', profile.id_equipe)
        .eq('tipo', 'tripeiro');

      // Get total paid to tripeiros
      const { data: payments } = await supabase
        .from('pagamentos_tripeiros')
        .select('valor_pago')
        .eq('id_equipe', profile.id_equipe);

      // Get pending payments
      const { data: pendingPayments } = await supabase
        .from('pagamentos_tripeiros')
        .select('valor_a_receber, valor_pago')
        .eq('id_equipe', profile.id_equipe)
        .neq('status', 'pago_total');

      const totalPaid = payments?.reduce((sum, p) => sum + Number(p.valor_pago), 0) || 0;
      const totalPending = pendingPayments?.reduce((sum, p) => 
        sum + (Number(p.valor_a_receber) - Number(p.valor_pago)), 0) || 0;

      return {
        totalTripeiros: tripeiros?.length || 0,
        totalPaid: totalPaid,
        totalPending: totalPending,
        totalPayments: payments?.length || 0,
      };
    },
    enabled: !!user?.id,
  });
}
