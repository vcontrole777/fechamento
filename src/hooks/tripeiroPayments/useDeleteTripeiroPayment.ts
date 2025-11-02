import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useDeleteTripeiroPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from("pagamentos_tripeiros")
        .delete()
        .eq("id", paymentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tripeiro-payments"] });
      toast({
        title: "Pagamento excluído",
        description: "O pagamento foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Error deleting tripeiro payment:", error);
      toast({
        title: "Erro ao excluir pagamento",
        description: "Ocorreu um erro ao excluir o pagamento.",
        variant: "destructive",
      });
    },
  });
}
