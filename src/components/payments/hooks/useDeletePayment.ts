
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function useDeletePayment() {
  const deletePayment = async (id: number) => {
    const { error } = await supabase
      .from("pagamentos")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao remover pagamento",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Pagamento removido",
      description: "O pagamento foi removido com sucesso.",
    });

    return true;
  };

  return { deletePayment };
}
