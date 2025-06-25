
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useResponsaveis() {
  const { data: responsaveis = [], isLoading, error } = useQuery({
    queryKey: ["responsaveis"],
    queryFn: async () => {
      console.log("Fetching responsaveis...");
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id_equipe")
        .eq("id", userData.user.id)
        .single();

      if (!profile?.id_equipe) throw new Error("Equipe não encontrada");

      const { data, error } = await supabase
        .from("pessoas")
        .select("*")
        .eq("id_equipe", profile.id_equipe)
        .eq("tipo", "responsavel")
        .order("nome");

      if (error) {
        console.error("Error fetching responsaveis:", error);
        throw error;
      }

      console.log("Fetched responsaveis:", data);
      return data || [];
    }
  });

  return {
    responsaveis,
    isLoading,
    error
  };
}
