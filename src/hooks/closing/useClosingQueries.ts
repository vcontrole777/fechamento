
import { usePaymentsQuery } from "../payments/usePaymentsQuery";
import { useExpensesQuery } from "../useDashboardQueries";
import { DateRange } from "@/types/payment.types";

export function useClosingQueries(dateRange: DateRange) {
  // Fetch payments data using the existing query hooks
  const paymentsQuery = usePaymentsQuery(
    { attendantIds: [], tripeiroIds: [], statuses: ["concluido"] },
    dateRange
  );
  
  // Fetch expenses data
  const expensesQuery = useExpensesQuery(dateRange);

  return {
    payments: paymentsQuery.data || [],
    expenses: expensesQuery.data || [],
    isLoading: paymentsQuery.isLoading || expensesQuery.isLoading,
  };
}
