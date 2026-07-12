
import { useState } from "react";
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
import { Payment } from "@/types/payment.types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatLocalDate } from "@/utils/date";

interface DeletePaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
  onSuccess: () => void;
}

export default function DeletePaymentDialog({
  open,
  onOpenChange,
  payment,
  onSuccess,
}: DeletePaymentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!payment) return;

    try {
      setIsDeleting(true);

      const { error } = await supabase
        .from("pagamentos")
        .delete()
        .eq("id", payment.id);

      if (error) {
        toast({
          title: "Erro ao remover pagamento",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Pagamento removido",
        description: "O pagamento foi removido com sucesso.",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error deleting payment:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!payment) return null;

  const formattedDate = formatLocalDate(payment.data);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Pagamento</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover o pagamento de {formattedDate} no valor de R$ {payment.valor}?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Removendo..." : "Remover"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
