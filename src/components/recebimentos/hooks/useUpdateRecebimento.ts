
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { UpdateRecebimento } from "@/types/recebimento.types";

export function useUpdateRecebimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateRecebimento }) => {
      console.log("Updating recebimento:", id, updates);

      const { data, error } = await supabase
        .from("recebimentos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating recebimento:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recebimentos"] });
      toast({
        title: "Sucesso!",
        description: "Recebimento atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error in useUpdateRecebimento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o recebimento.",
        variant: "destructive",
      });
    },
  });
}
