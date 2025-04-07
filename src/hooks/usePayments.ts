
import { useState, useEffect } from "react";
import { usePaymentsQuery } from "@/hooks/payments/usePaymentsQuery";
import { PaymentFilters } from "@/types/payment.types";
import { DateRange } from "@/components/common/date-filter/types";

export function usePayments(initialDateRange: DateRange) {
  const [filters, setFilters] = useState<PaymentFilters>({
    atendentes: [],
    tripeiros: [],
    tipos: [],
    statuses: [],
  });
  
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);
  
  const {
    data: payments,
    isLoading,
    isError,
    refetch,
  } = usePaymentsQuery(filters, dateRange);

  const clearFilters = () => {
    setFilters({
      atendentes: [],
      tripeiros: [],
      tipos: [],
      statuses: [],
    });
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
  };
}
