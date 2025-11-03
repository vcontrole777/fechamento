
import React from "react";
import { format } from "date-fns";
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
    
    try {
      console.log("Parsing expense date for form:", expense.data, typeof expense.data);
      
      let parsedDate: Date;
      
      // Check if it's already a Date object
      if (Object.prototype.toString.call(expense.data) === '[object Date]') {
        parsedDate = expense.data as unknown as Date;
      }
      // Handle string date in YYYY-MM-DD format
      else if (typeof expense.data === 'string' && expense.data.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Parse the date from ISO format (YYYY-MM-DD)
        const [year, month, day] = expense.data.split('-').map(Number);
        parsedDate = new Date(year, month - 1, day); // month is 0-based in JavaScript
      }
      // Handle ISO date strings
      else if (typeof expense.data === 'string' && (expense.data.includes('T') || expense.data.includes(':'))) {
        parsedDate = new Date(expense.data);
      }
      // Fallback
      else {
        parsedDate = new Date(expense.data);
      }
      
      console.log("Parsed expense date for form:", parsedDate);
      
      return {
        descricao: expense.descricao,
        valor: expense.valor,
        data: parsedDate,
        id_responsavel: expense.id_responsavel,
        categoria: expense.categoria,
      };
    } catch (error) {
      console.error("Error parsing expense date for form:", error);
      // Fallback to current date if parsing fails
      return {
        descricao: expense.descricao,
        valor: expense.valor,
        data: new Date(),
        id_responsavel: expense.id_responsavel,
        categoria: expense.categoria,
      };
    }
  };

  const handleSubmit = async (values: ExpenseFormValues) => {
    if (!expense) return;

    try {
      console.log("Submitting expense with date:", values.data);
      
      // Format date as YYYY-MM-DD for storage
      const formattedDate = format(values.data, "yyyy-MM-dd");
      console.log("Formatted expense date for storage:", formattedDate);

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
