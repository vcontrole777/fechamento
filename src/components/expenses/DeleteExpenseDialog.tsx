
import React from "react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { type Expense } from "@/hooks/useExpenses";

interface DeleteExpenseDialogProps {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function DeleteExpenseDialog({
  expense,
  open,
  onOpenChange,
  onSuccess,
}: DeleteExpenseDialogProps) {
  async function handleDelete() {
    if (!expense) return;

    const { error } = await supabase
      .from("despesas")
      .delete()
      .eq("id", expense.id);

    if (error) {
      toast({
        title: "Erro ao excluir despesa",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Despesa excluída",
      description: "A despesa foi excluída com sucesso.",
    });

    onOpenChange(false);
    onSuccess();
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Despesa</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir esta despesa?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
