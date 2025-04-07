
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ExpenseFormValues } from "../schemas/expenseFormSchema";

export function useAddExpense() {
  const addExpense = async (values: ExpenseFormValues) => {
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
    
    console.log("Expense date to be stored (custom format):", formattedDate);
    
    const { data, error } = await supabase.from("despesas").insert({
      descricao: values.descricao,
      valor: values.valor,
      data: formattedDate,
      id_responsavel: values.id_responsavel ? parseInt(values.id_responsavel) : null,
      id_equipe: id_equipe,
    });

    if (error) {
      toast({
        title: "Erro ao adicionar despesa",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Despesa adicionada",
      description: "A despesa foi adicionada com sucesso.",
    });

    return data;
  };

  return { addExpense };
}
