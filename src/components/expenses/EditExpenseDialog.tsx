
import React, { useEffect } from "react";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ExpenseForm } from "./ExpenseForm";
import { ExpenseFormValues } from "./schemas/expenseFormSchema";
import { type Expense } from "@/hooks/useExpenses";

// Brazil São Paulo timezone
const TIMEZONE = "America/Sao_Paulo";

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
    
    const parsedDate = parse(expense.data, "yyyy-MM-dd", new Date());
    const zonedDate = toZonedTime(parsedDate, TIMEZONE);
    
    return {
      descricao: expense.descricao,
      valor: expense.valor,
      data: zonedDate,
      id_responsavel: expense.id_responsavel?.toString(),
    };
  };

  const handleSubmit = async (values: ExpenseFormValues) => {
    if (!expense) return;

    const { error } = await supabase
      .from("despesas")
      .update({
        descricao: values.descricao,
        valor: values.valor,
        data: format(values.data, "yyyy-MM-dd"),
        id_responsavel: values.id_responsavel ? parseInt(values.id_responsavel) : null,
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
          submitButtonText="Salvar Alterações"
        />
      </DialogContent>
    </Dialog>
  );
}
