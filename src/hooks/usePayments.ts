
import { useState, useEffect, useCallback } from "react";
import { usePaymentsQuery } from "@/hooks/payments/usePaymentsQuery";
import { Payment, PaymentFilters, Attendant, Tripeiro } from "@/types/payment.types";
import { DateRange } from "@/components/common/date-filter/types";
import { useDialogState } from "@/hooks/useDialogState";
import { usePaymentCalculations } from "@/hooks/payments/usePaymentCalculations";

export type { Payment, PaymentFilters, Attendant, Tripeiro };

export function usePayments(initialDateRange?: DateRange) {
  const [filters, setFilters] = useState<PaymentFilters>({
    attendantIds: [],
    tripeiroIds: [],
    statuses: [],
  });
  
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange || {
    from: new Date(),
    to: new Date()
  });
  
  const {
    data: payments = [],
    isLoading,
    isError,
    refetch,
  } = usePaymentsQuery(filters, dateRange);

  const { calculateTotals } = usePaymentCalculations();
  const { totalPayments, totalAttendantCommission, totalTripeiroReceivable, totalReferralCommission } = calculateTotals(payments);

  // Dialog state management
  const dialogState = useDialogState<Payment>();

  const clearFilters = () => {
    setFilters({
      attendantIds: [],
      tripeiroIds: [],
      statuses: [],
    });
  };

  const updateFilters = (newFilters: Partial<PaymentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const updateDateRange = useCallback((newDateRange: DateRange) => {
    setDateRange(prev => {
      const unchanged =
        (prev.from?.getTime() ?? null) === (newDateRange.from?.getTime() ?? null) &&
        (prev.to?.getTime() ?? null) === (newDateRange.to?.getTime() ?? null);

      return unchanged ? prev : newDateRange;
    });
  }, []);

  return {
    payments,
    isLoading,
    isError,
    refetch,
    filters,
    setFilters,
    clearFilters,
    dateRange,
    setDateRange,
    updateFilters,
    updateDateRange,
    totalPayments,
    totalAttendantCommission,
    totalTripeiroReceivable,
    totalReferralCommission,
    // Dialog state
    isAddingPayment: dialogState.isAdding,
    isEditingPayment: dialogState.isEditing,
    isDeletingPayment: dialogState.isDeleting,
    selectedPayment: dialogState.selected,
    openAddPaymentDialog: dialogState.openAdd,
    closeAddPaymentDialog: dialogState.closeAdd,
    openEditPaymentDialog: dialogState.openEdit,
    closeEditPaymentDialog: dialogState.closeEdit,
    openDeletePaymentDialog: dialogState.openDelete,
    closeDeletePaymentDialog: dialogState.closeDelete,
  };
}
