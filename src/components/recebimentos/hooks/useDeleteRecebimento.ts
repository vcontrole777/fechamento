
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useDeleteRecebimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      console.log("Deleting recebimento:", id);

      const { error } = await supabase
        .from("recebimentos")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting recebimento:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recebimentos"] });
      toast({
        title: "Sucesso!",
        description: "Recebimento excluído com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error in useDeleteRecebimento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o recebimento.",
        variant: "destructive",
      });
    },
  });
}
