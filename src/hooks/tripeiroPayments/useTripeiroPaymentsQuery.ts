import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TripeiroPayment } from "@/types/tripeiroPayment.types";
import { useTeamView } from "@/contexts/TeamViewContext";

export function useTripeiroPaymentsQuery(tripeiroId: number, periodoInicio: string, periodoFim: string) {
  const { viewingAsTeamId } = useTeamView();

  return useQuery({
    queryKey: ["tripeiro-payments", tripeiroId, periodoInicio, periodoFim, viewingAsTeamId],
    queryFn: async () => {
      let query = supabase
        .from("pagamentos_tripeiros")
        .select(`
          *
        `)
        .eq("id_tripeiro", tripeiroId)
        .eq("periodo_inicio", periodoInicio)
        .eq("periodo_fim", periodoFim);

      if (viewingAsTeamId !== null) {
        query = query.eq("id_equipe", viewingAsTeamId);
      }

      const { data, error } = await query.order("data_pagamento", { ascending: false });

      if (error) throw error;

      // Buscar o nome do tripeiro manualmente
      const { data: tripeiroData } = await supabase
        .from("pessoas")
        .select("id, nome")
        .eq("id", tripeiroId)
        .single();

      return (data || []).map(payment => ({
        ...payment,
        tripeiro: tripeiroData ? { id: tripeiroData.id, nome: tripeiroData.nome } : undefined,
      })) as TripeiroPayment[];
    },
    enabled: !!tripeiroId && !!periodoInicio && !!periodoFim,
  });
}
