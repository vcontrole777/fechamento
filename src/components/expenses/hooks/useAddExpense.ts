
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ExpenseFormValues } from "../schemas/expenseFormSchema";
import { useAuth } from "@/hooks/useAuth";
import { parseLocalDate, toISODateString } from "@/utils/date";

export function useAddExpense() {
  const { ownTeamId } = useAuth();

  const addExpense = async (values: ExpenseFormValues) => {
    if (!ownTeamId) {
      throw new Error("Equipe não encontrada");
    }

    const formattedDate = toISODateString(parseLocalDate(values.data)!);

    const { data, error } = await supabase.from("despesas").insert({
      descricao: values.descricao,
      valor: values.valor,
      data: formattedDate,
      id_responsavel: values.id_responsavel || null,
      categoria: values.categoria || null,
      id_equipe: ownTeamId,
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
