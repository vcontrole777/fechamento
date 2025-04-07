
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
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

    // Ensure date is a Date object
    if (!(values.data instanceof Date)) {
      console.error("Date is not a Date instance:", values.data);
      values.data = new Date(values.data);
    }
    
    // Log detailed date information
    console.log("Date object year:", values.data.getFullYear());
    console.log("Date object month:", values.data.getMonth() + 1); // +1 because getMonth is 0-indexed
    console.log("Date object day:", values.data.getDate());
    
    // Create ISO string with YYYY-MM-DD format (with timezone handling)
    // This preserves the day regardless of timezone
    const year = values.data.getFullYear();
    const month = values.data.getMonth() + 1; // getMonth returns 0-11
    const day = values.data.getDate();
    
    const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    
    console.log("Payment date to be stored (custom format):", formattedDate);
    
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
