
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

    const { data, error } = await supabase.from("despesas").insert({
      descricao: values.descricao,
      valor: values.valor,
      data: format(values.data, "yyyy-MM-dd"),
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
