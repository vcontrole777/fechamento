
import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseFormValues } from "./schemas/expenseFormSchema";
import { type Expense } from "@/hooks/useExpenses";
import { parseLocalDate, toISODateString } from "@/utils/date";

interface EditExpenseDialogProps {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function EditExpenseDialog({
  expense,
  open,
  onOpenChange,
  onSuccess,
}: EditExpenseDialogProps) {
  
  // Format expense data for the form
  const getDefaultValues = (): Partial<ExpenseFormValues> => {
    if (!expense) return {};

    return {
      descricao: expense.descricao,
      valor: expense.valor,
      data: parseLocalDate(expense.data) || new Date(),
      id_responsavel: expense.id_responsavel,
      categoria: expense.categoria,
    };
  };

  const handleSubmit = async (values: ExpenseFormValues) => {
    if (!expense) return;

    try {
      const formattedDate = toISODateString(values.data);

      const { error } = await supabase
        .from("despesas")
        .update({
          descricao: values.descricao,
          valor: values.valor,
          data: formattedDate,
          id_responsavel: values.id_responsavel || null,
          categoria: values.categoria || null,
        })
        .eq("id", expense.id);

      if (error) {
        toast({
          title: "Erro ao atualizar despesa",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Despesa atualizada",
        description: "A despesa foi atualizada com sucesso.",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating expense:", error);
      toast({
        title: "Erro ao atualizar despesa",
        description: "Ocorreu um erro ao atualizar a despesa.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Despesa</DialogTitle>
        </DialogHeader>
        
        <ExpenseForm 
          defaultValues={getDefaultValues()} 
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}
