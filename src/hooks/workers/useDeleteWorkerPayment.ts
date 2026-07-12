import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { WorkerType, paymentTableFor } from "./workerConfig";

export function useDeleteWorkerPayment(tipo: WorkerType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from(paymentTableFor(tipo))
        .delete()
        .eq("id", paymentId);

      if (error) {
        console.error(`Error deleting ${tipo} payment:`, error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker-payments", tipo] });
      toast({
        title: "Pagamento excluído",
        description: "O pagamento foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      console.error(`Error deleting ${tipo} payment:`, error);
      toast({
        title: "Erro ao excluir pagamento",
        description: "Não foi possível excluir o pagamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}
