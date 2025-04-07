
import { useState } from "react";
import { Payment } from "@/types/payment.types";

export function usePaymentDialogState() {
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const openAddPaymentDialog = () => {
    setIsAddingPayment(true);
  };

  const closeAddPaymentDialog = () => {
    setIsAddingPayment(false);
  };

  const openEditPaymentDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsEditingPayment(true);
  };

  const closeEditPaymentDialog = () => {
    setIsEditingPayment(false);
    setSelectedPayment(null);
  };

  const openDeletePaymentDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDeletingPayment(true);
  };

  const closeDeletePaymentDialog = () => {
    setIsDeletingPayment(false);
    setSelectedPayment(null);
  };

  return {
    isAddingPayment,
    isEditingPayment,
    isDeletingPayment,
    selectedPayment,
    openAddPaymentDialog,
    closeAddPaymentDialog,
    openEditPaymentDialog,
    closeEditPaymentDialog,
    openDeletePaymentDialog,
    closeDeletePaymentDialog,
  };
}
