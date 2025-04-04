
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Responsavel {
  id: number;
  nome: string;
}

export function useResponsaveis() {
  return useQuery({
    queryKey: ["responsaveis"],
    queryFn: async (): Promise<Responsavel[]> => {
      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome")
        .eq("tipo", "responsavel")
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
  });
}
