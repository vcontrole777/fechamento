
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentForm } from "./PaymentForm";
import { PaymentFormValues } from "./schemas/paymentFormSchema";
import { useAddPayment } from "./hooks/useAddPayment";

interface NewPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function NewPaymentDialog({
  open,
  onOpenChange,
  onSuccess,
}: NewPaymentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addPayment } = useAddPayment();

  const handleSubmit = async (
    values: PaymentFormValues, 
    attendantPercentage: number, 
    tripeiroPercentage: number
  ) => {
    try {
      setIsSubmitting(true);
      await addPayment(values, attendantPercentage, tripeiroPercentage);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error adding payment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Novo Pagamento</DialogTitle>
        </DialogHeader>
        <PaymentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
