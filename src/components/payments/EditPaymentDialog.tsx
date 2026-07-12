
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentForm } from "./PaymentForm";
import { PaymentFormValues } from "./schemas/paymentFormSchema";
import { useUpdatePayment } from "./hooks/useUpdatePayment";
import { Payment } from "@/types/payment.types";

interface EditPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
  onSuccess: () => void;
}

export default function EditPaymentDialog({
  open,
  onOpenChange,
  payment,
  onSuccess,
}: EditPaymentDialogProps) {
  
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updatePayment } = useUpdatePayment();

  const handleSubmit = async (
    values: PaymentFormValues,
    attendantPercentage: number,
    tripeiroPercentage: number,
    idIndicador: number | null,
    percentageIndicacao: number
  ) => {
    if (!payment) return;

    try {
      setIsSubmitting(true);
      await updatePayment(payment.id, values, attendantPercentage, tripeiroPercentage, idIndicador, percentageIndicacao);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error updating payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Pagamento</DialogTitle>
        </DialogHeader>
        <PaymentForm 
          onSubmit={handleSubmit} 
          payment={payment} 
          isSubmitting={isSubmitting} 
        />
      </DialogContent>
    </Dialog>
  );
}
