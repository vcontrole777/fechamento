
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NewRecebimento } from "@/types/recebimento.types";

export function useAddRecebimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recebimento: NewRecebimento) => {
      console.log("Adding recebimento:", recebimento);

      // Get user's team ID
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id_equipe")
        .eq("id", userData.user.id)
        .single();

      if (!profile?.id_equipe) throw new Error("Equipe não encontrada");

      const { data, error } = await supabase
        .from("recebimentos")
        .insert({
          ...recebimento,
          id_equipe: profile.id_equipe,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding recebimento:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recebimentos"] });
      toast({
        title: "Sucesso!",
        description: "Recebimento adicionado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error in useAddRecebimento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o recebimento.",
        variant: "destructive",
      });
    },
  });
}
