
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";
import { PaymentFormValues } from "../schemas/paymentFormSchema";

export function useAddPayment() {
  const addPayment = async (values: PaymentFormValues, attendantPercentage: number, tripeiroPercentage: number) => {
    // Get the user's equipe_id
    const { data: userData, error: userError } = await supabase.rpc('get_user_equipe_id');
    
    if (userError) {
      toast({
        title: "Erro ao obter informações do usuário",
        description: userError.message,
        variant: "destructive",
      });
      throw userError;
    }
    
    const id_equipe = userData;

    // Ensure date is a Date object before formatting
    const paymentDate = values.data instanceof Date ? values.data : new Date(values.data);
    
    // Format date in ISO format (YYYY-MM-DD) for database storage
    const formattedDate = format(paymentDate, "yyyy-MM-dd");
    
    console.log("Payment date to be stored:", formattedDate);
    console.log("Original date object:", paymentDate);

    const { data, error } = await supabase.from("pagamentos").insert({
      data: formattedDate,
      valor: values.valor,
      tipo: values.tipo,
      status: values.status,
      id_atendente: values.id_atendente ? parseInt(values.id_atendente) : null,
      id_tripeiro: values.id_tripeiro ? parseInt(values.id_tripeiro) : null,
      porcentagem_atendente: attendantPercentage,
      porcentagem_tripeiro: tripeiroPercentage,
      id_equipe: id_equipe,
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
