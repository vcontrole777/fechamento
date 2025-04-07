
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
import { useDeletePayment } from "./hooks/useDeletePayment";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const { deletePayment } = useDeletePayment();

  const handleConfirm = async () => {
    if (!payment) return;
    
    try {
      setIsDeleting(true);
      await deletePayment(payment.id);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error deleting payment:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!payment) return null;

  const paymentDate = new Date(payment.data);
  const formattedDate = format(paymentDate, "dd/MM/yyyy", { locale: ptBR });

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
