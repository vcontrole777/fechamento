
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useDeleteContaBancaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      console.log("Deleting conta bancária:", id);
      
      const { error } = await supabase
        .from("contas_bancarias")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting conta bancária:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      toast.success("Conta bancária excluída com sucesso!");
    },
    onError: (error: any) => {
      console.error("Error deleting conta bancária:", error);
      toast.error("Erro ao excluir conta bancária");
    }
  });
}
