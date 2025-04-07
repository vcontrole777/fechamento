import { useState, useEffect } from "react";
import { format, startOfDay, endOfDay } from "date-fns";
import { PaymentFilters, DateRange } from "@/types/payment.types";
import { usePaymentsQuery } from "./payments/usePaymentsQuery";
import { usePaymentCalculations } from "./payments/usePaymentCalculations";
import { usePaymentDialogState } from "./payments/usePaymentDialogState";
import { useSharedDateFilter } from "./useSharedDateFilter";

export type { Attendant, Tripeiro, Payment } from "@/types/payment.types";
export type { PaymentFilters } from "@/types/payment.types";

export function usePayments() {
  const [filters, setFilters] = useState<PaymentFilters>({
    attendantIds: [],
    tripeiroIds: [],
    statuses: [],
  });
  
  const { dateRange: sharedDateRange, updateSharedDateFilter } = useSharedDateFilter();
  const [dateRange, setDateRange] = useState<DateRange>(sharedDateRange);

  useEffect(() => {
    setDateRange(sharedDateRange);
  }, [sharedDateRange]);

  const { data: payments, isLoading, refetch } = usePaymentsQuery(filters, dateRange);
  const { calculateTotals } = usePaymentCalculations();
  const dialogState = usePaymentDialogState();

  const { 
    totalPayments, 
    totalAttendantCommission, 
    totalTripeiroReceivable,
    netTotal
  } = calculateTotals(payments);

  const updateFilters = (newFilters: Partial<PaymentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const updateDateRange = (range: DateRange) => {
    // Make sure we're using startOfDay and endOfDay correctly
    const newRange: DateRange = {
      from: range.from ? startOfDay(range.from) : null,
      to: range.to ? endOfDay(range.to) : null
    };
    
    console.log("Updating date range in usePayments:", {
      from: newRange.from ? format(newRange.from, 'yyyy-MM-dd') : null,
      to: newRange.to ? format(newRange.to, 'yyyy-MM-dd') : null
    });
    
    setDateRange(newRange);
  };

  return {
    payments,
    isLoading,
    totalPayments,
    totalAttendantCommission,
    totalTripeiroReceivable,
    netTotal,
    filters,
    dateRange,
    updateFilters,
    updateDateRange,
    refetch,
    ...dialogState
  };
}
