
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { NewRecebimento } from "@/types/recebimento.types";

export function useAddRecebimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      console.log("Adding recebimento(s):", data);

      // Get user's team ID
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id_equipe")
        .eq("id", userData.user.id)
        .single();

      if (!profile?.id_equipe) throw new Error("Equipe não encontrada");

      if (data.multiplos && data.recebimentos) {
        // Inserir múltiplos recebimentos
        const recebimentosParaInserir = data.recebimentos.map((recebimento: NewRecebimento) => ({
          ...recebimento,
          id_equipe: profile.id_equipe,
        }));

        const { data: result, error } = await supabase
          .from("recebimentos")
          .insert(recebimentosParaInserir)
          .select();

        if (error) {
          console.error("Error adding multiple recebimentos:", error);
          throw error;
        }

        return result;
      } else {
        // Inserir um único recebimento
        const { data: result, error } = await supabase
          .from("recebimentos")
          .insert({
            ...data,
            id_equipe: profile.id_equipe,
          })
          .select()
          .single();

        if (error) {
          console.error("Error adding recebimento:", error);
          throw error;
        }

        return result;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["recebimentos"] });
      
      if (Array.isArray(data)) {
        toast({
          title: "Sucesso!",
          description: `${data.length} recebimentos adicionados com sucesso.`,
        });
      } else {
        toast({
          title: "Sucesso!",
          description: "Recebimento adicionado com sucesso.",
        });
      }
    },
    onError: (error) => {
      console.error("Error in useAddRecebimento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o(s) recebimento(s).",
        variant: "destructive",
      });
    },
  });
}
