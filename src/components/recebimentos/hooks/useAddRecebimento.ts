
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

      if (data.multiplos && data.recebimentos && Array.isArray(data.recebimentos)) {
        // Inserir múltiplos recebimentos
        console.log("Processing multiple recebimentos:", data.recebimentos);
        
        const recebimentosParaInserir = data.recebimentos.map((recebimento: NewRecebimento) => ({
          id_tripeiro: recebimento.id_tripeiro,
          valor: recebimento.valor,
          data: recebimento.data,
          observacoes: recebimento.observacoes || null,
          conta_depositada: recebimento.conta_depositada || null,
          numero_comprovante: recebimento.numero_comprovante || null,
          banco: recebimento.banco || null,
          tipo_deposito: recebimento.tipo_deposito || "deposito",
          id_equipe: profile.id_equipe,
        }));

        console.log("Inserting multiple recebimentos:", recebimentosParaInserir);

        const { data: result, error } = await supabase
          .from("recebimentos")
          .insert(recebimentosParaInserir)
          .select();

        if (error) {
          console.error("Error adding multiple recebimentos:", error);
          throw error;
        }

        console.log("Successfully inserted multiple recebimentos:", result);
        return result;
      } else {
        // Inserir um único recebimento
        console.log("Processing single recebimento:", data);
        
        const recebimentoParaInserir = {
          id_tripeiro: data.id_tripeiro,
          valor: data.valor,
          data: data.data,
          observacoes: data.observacoes || null,
          conta_depositada: data.conta_depositada || null,
          numero_comprovante: data.numero_comprovante || null,
          banco: data.banco || null,
          tipo_deposito: data.tipo_deposito || "deposito",
          id_equipe: profile.id_equipe,
        };

        console.log("Inserting single recebimento:", recebimentoParaInserir);

        const { data: result, error } = await supabase
          .from("recebimentos")
          .insert(recebimentoParaInserir)
          .select()
          .single();

        if (error) {
          console.error("Error adding recebimento:", error);
          throw error;
        }

        console.log("Successfully inserted single recebimento:", result);
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
