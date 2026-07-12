
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PaymentFormValues } from "../schemas/paymentFormSchema";
import { useAuth } from "@/hooks/useAuth";
import { toISODateString } from "@/utils/date";

export function useAddPayment() {
  const { ownTeamId } = useAuth();

  const addPayment = async (
    values: PaymentFormValues,
    attendantPercentage: number,
    tripeiroPercentage: number,
    idIndicador: number | null,
    percentageIndicacao: number
  ) => {
    if (!ownTeamId) {
      throw new Error("Equipe não encontrada");
    }

    const formattedDate = toISODateString(
      values.data instanceof Date ? values.data : new Date(values.data)
    );

    const { data, error } = await supabase.from("pagamentos").insert({
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
      id_equipe: ownTeamId,
    });

    if (error) {
      toast({
        title: "Erro ao adicionar pagamento",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Pagamento adicionado",
      description: "O pagamento foi adicionado com sucesso.",
    });

    return data;
  };

  return { addPayment };
}
