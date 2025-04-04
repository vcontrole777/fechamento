
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Attendant, Tripeiro } from "@/hooks/usePayments";

export function useAttendantsAndTripeiros() {
  const { data: attendants, isLoading: isLoadingAttendants } = useQuery({
    queryKey: ["payment-attendants"],
    queryFn: async (): Promise<Attendant[]> => {
      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome, porcentagem")
        .eq("tipo", "atendente")
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
  });

  const { data: tripeiros, isLoading: isLoadingTripeiros } = useQuery({
    queryKey: ["payment-tripeiros"],
    queryFn: async (): Promise<Tripeiro[]> => {
      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome, porcentagem")
        .eq("tipo", "tripeiro")
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
  });

  return {
    attendants: attendants || [],
    tripeiros: tripeiros || [],
    isLoading: isLoadingAttendants || isLoadingTripeiros
  };
}
