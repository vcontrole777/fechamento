
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useEffectiveTeamId } from "@/hooks/useEffectiveTeamId";

export interface Responsavel {
  id: number;
  nome: string;
}

export function useResponsaveis() {
  const teamId = useEffectiveTeamId();

  return useQuery({
    queryKey: ["responsaveis", teamId],
    queryFn: async (): Promise<Responsavel[]> => {
      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome")
        .eq("tipo", "responsavel")
        .eq("id_equipe", teamId)
        .order("nome");

      if (error) {
        toast({
          title: "Erro ao carregar responsáveis",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
    enabled: !!teamId,
  });
}
