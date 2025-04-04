
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { PaymentFormValues } from "../schemas/paymentFormSchema";

export function useUpdatePayment() {
  const updatePayment = async (
    id: number, 
    values: PaymentFormValues, 
    attendantPercentage: number, 
    tripeiroPercentage: number
  ) => {
    const { data, error } = await supabase
      .from("pagamentos")
      .update({
        data: format(values.data, "yyyy-MM-dd"),
        valor: values.valor,
        tipo: values.tipo,
        status: values.status,
        id_atendente: values.id_atendente ? parseInt(values.id_atendente) : null,
        id_tripeiro: values.id_tripeiro ? parseInt(values.id_tripeiro) : null,
        porcentagem_atendente: attendantPercentage,
        porcentagem_tripeiro: tripeiroPercentage,
      })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao atualizar pagamento",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Pagamento atualizado",
      description: "O pagamento foi atualizado com sucesso.",
    });

    return data;
  };

  return { updatePayment };
}
