
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Attendant, Tripeiro } from "@/types/payment.types";
import { useAuth } from "@/hooks/useAuth";

export function useAttendantsAndTripeiros() {
  const { ownTeamId } = useAuth();

  const { data: attendants, isLoading: isLoadingAttendants } = useQuery({
    queryKey: ["payment-attendants", ownTeamId],
    queryFn: async (): Promise<Attendant[]> => {
      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome, porcentagem, id_indicador, porcentagem_indicacao")
        .eq("tipo", "atendente")
        .eq("id_equipe", ownTeamId)
        .order("nome");

      if (error) {
        toast({
          title: "Erro ao carregar atendentes",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data.map(item => ({
        ...item,
        porcentagem: item.porcentagem || 0
      }));
    },
    enabled: !!ownTeamId,
  });

  const { data: tripeiros, isLoading: isLoadingTripeiros } = useQuery({
    queryKey: ["payment-tripeiros", ownTeamId],
    queryFn: async (): Promise<Tripeiro[]> => {
      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome, porcentagem")
        .eq("tipo", "tripeiro")
        .eq("id_equipe", ownTeamId)
        .order("nome");

      if (error) {
        toast({
          title: "Erro ao carregar tripeiros",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data.map(item => ({
        ...item,
        porcentagem: item.porcentagem || 0
      }));
    },
    enabled: !!ownTeamId,
  });

  return {
    attendants: attendants || [],
    tripeiros: tripeiros || [],
    isLoading: isLoadingAttendants || isLoadingTripeiros
  };
}
