import { useState } from "react";
import { useAttendantPaymentsQuery } from "./attendantPayments/useAttendantPaymentsQuery";
import { useAddAttendantPayment } from "./attendantPayments/useAddAttendantPayment";
import { useUpdateAttendantPayment } from "./attendantPayments/useUpdateAttendantPayment";
import { useDeleteAttendantPayment } from "./attendantPayments/useDeleteAttendantPayment";
import { AttendantPayment } from "@/types/attendantPayment.types";
import { DateRange } from "@/components/common/date-filter/types";

export function useAttendantPayments(dateRange: DateRange) {
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedAttendantId, setSelectedAttendantId] = useState<number | null>(null);
  const [editingPayment, setEditingPayment] = useState<AttendantPayment | null>(null);

  const { data: payments = [], isLoading } = useAttendantPaymentsQuery(dateRange);
  const addPayment = useAddAttendantPayment();
  const updatePayment = useUpdateAttendantPayment();
  const deletePayment = useDeleteAttendantPayment();

  const openRegisterDialog = (attendantId: number) => {
    setSelectedAttendantId(attendantId);
    setIsRegisterDialogOpen(true);
  };

  const closeRegisterDialog = () => {
    setIsRegisterDialogOpen(false);
    setSelectedAttendantId(null);
    setEditingPayment(null);
  };

  const openHistoryDialog = (attendantId: number) => {
    setSelectedAttendantId(attendantId);
    setIsHistoryDialogOpen(true);
  };

  const closeHistoryDialog = () => {
    setIsHistoryDialogOpen(false);
    setSelectedAttendantId(null);
  };

  // Calculate total paid for a specific attendant in the current period
  const getTotalPaidForAttendant = (attendantId: number): number => {
    return payments
      .filter(p => p.id_atendente === attendantId)
      .reduce((sum, p) => sum + Number(p.valor_pago), 0);
  };

  // Get payment status for an attendant
  const getAttendantPaymentStatus = (attendantId: number, totalCommission: number): 'pendente' | 'pago_parcial' | 'pago_total' => {
    const totalPaid = getTotalPaidForAttendant(attendantId);
    
    if (totalPaid === 0) return 'pendente';
    if (totalPaid < totalCommission) return 'pago_parcial';
    return 'pago_total';
  };

  // Get payments for a specific attendant
  const getPaymentsForAttendant = (attendantId: number): AttendantPayment[] => {
    return payments.filter(p => p.id_atendente === attendantId);
  };

  return {
    payments,
    isLoading,
    isRegisterDialogOpen,
    isHistoryDialogOpen,
    selectedAttendantId,
    editingPayment,
    openRegisterDialog,
    closeRegisterDialog,
    openHistoryDialog,
    closeHistoryDialog,
    addPayment,
    updatePayment,
    deletePayment,
    getTotalPaidForAttendant,
    getAttendantPaymentStatus,
    getPaymentsForAttendant,
    setEditingPayment,
  };
}
