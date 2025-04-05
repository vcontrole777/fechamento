
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExpenseForm } from "./ExpenseForm";
import { useAddExpense } from "./hooks/useAddExpense";
import { ExpenseFormValues } from "./schemas/expenseFormSchema";
import { toZonedTime } from "date-fns-tz";

// Brazil São Paulo timezone
const TIMEZONE = "America/Sao_Paulo";

interface NewExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function NewExpenseDialog({
  open,
  onOpenChange,
  onSuccess,
}: NewExpenseDialogProps) {
  const { addExpense } = useAddExpense();

  // Default to today's date in Brazil timezone
  const defaultValues: Partial<ExpenseFormValues> = {
    data: toZonedTime(new Date(), TIMEZONE),
  };

  const handleSubmit = async (values: ExpenseFormValues) => {
    try {
      await addExpense(values);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Despesa</DialogTitle>
        </DialogHeader>
        <ExpenseForm 
          defaultValues={defaultValues} 
          onSubmit={handleSubmit} 
        />
      </DialogContent>
    </Dialog>
  );
}
