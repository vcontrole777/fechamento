
import { usePaymentsQuery } from "../payments/usePaymentsQuery";
import { useExpensesQuery } from "../expenses/useExpensesQuery";
import { DateRange } from "@/components/common/date-filter/types";
import { Expense } from "../expenses/useExpensesQuery";

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
