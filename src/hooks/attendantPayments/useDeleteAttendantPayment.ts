import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useDeleteAttendantPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from('pagamentos_atendentes')
        .delete()
        .eq('id', paymentId);

      if (error) {
        console.error('Error deleting attendant payment:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendant-payments'] });
      toast({
        title: "Pagamento excluído",
        description: "O pagamento foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      console.error('Error deleting attendant payment:', error);
      toast({
        title: "Erro ao excluir pagamento",
        description: "Não foi possível excluir o pagamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });
}
