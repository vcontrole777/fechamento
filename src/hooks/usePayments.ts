
import { useState, useEffect } from "react";
import { usePaymentsQuery } from "@/hooks/payments/usePaymentsQuery";
import { Payment, PaymentFilters, Attendant, Tripeiro } from "@/types/payment.types";
import { DateRange } from "@/components/common/date-filter/types";
import { usePaymentDialogState } from "@/hooks/payments/usePaymentDialogState";
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
  const { totalPayments, totalAttendantCommission, totalTripeiroReceivable } = calculateTotals(payments);

  // Dialog state management
  const {
    isAddingPayment,
    isEditingPayment,
    isDeletingPayment,
    selectedPayment,
    openAddPaymentDialog,
    closeAddPaymentDialog,
    openEditPaymentDialog,
    closeEditPaymentDialog,
    openDeletePaymentDialog,
    closeDeletePaymentDialog
  } = usePaymentDialogState();

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

  const updateDateRange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

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
    // Dialog state
    isAddingPayment,
    isEditingPayment,
    isDeletingPayment,
    selectedPayment,
    openAddPaymentDialog,
    closeAddPaymentDialog,
    openEditPaymentDialog,
    closeEditPaymentDialog,
    openDeletePaymentDialog,
    closeDeletePaymentDialog
  };
}
