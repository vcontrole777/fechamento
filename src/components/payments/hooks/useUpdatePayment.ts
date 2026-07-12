
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PaymentFormValues } from "../schemas/paymentFormSchema";
import { toISODateString } from "@/utils/date";

export function useUpdatePayment() {
  const updatePayment = async (
    id: number,
    values: PaymentFormValues,
    attendantPercentage: number,
    tripeiroPercentage: number,
    idIndicador: number | null,
    percentageIndicacao: number
  ) => {
    const formattedDate = toISODateString(
      values.data instanceof Date ? values.data : new Date(values.data)
    );

    const { data, error } = await supabase
      .from("pagamentos")
      .update({
        data: formattedDate,
        valor: values.valor,
        tipo: values.tipo,
        status: values.status,
        id_atendente: values.id_atendente ? parseInt(values.id_atendente) : null,
        id_tripeiro: values.id_tripeiro ? parseInt(values.id_tripeiro) : null,
        porcentagem_atendente: attendantPercentage,
        porcentagem_tripeiro: tripeiroPercentage,
        id_indicador: idIndicador,
        porcentagem_indicacao: percentageIndicacao,
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
