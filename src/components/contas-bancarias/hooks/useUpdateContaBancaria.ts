
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UpdateContaBancaria } from "@/types/conta-bancaria.types";

export function useUpdateContaBancaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: UpdateContaBancaria }) => {
      console.log("Updating conta bancária:", { id, updates });
      
      const { data, error } = await supabase
        .from("contas_bancarias")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating conta bancária:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      toast.success("Conta bancária atualizada com sucesso!");
    },
    onError: (error: any) => {
      console.error("Error updating conta bancária:", error);
      toast.error("Erro ao atualizar conta bancária");
    }
  });
}
