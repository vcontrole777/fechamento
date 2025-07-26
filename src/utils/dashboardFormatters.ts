
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBrazilianCurrency } from "@/components/ui/currency-input";

// Define a type for the status to ensure type safety
type TransactionStatus = "completed" | "pending" | "failed";

// Format recent payments for display
export function formatRecentPayments(payments: any[]) {
  // Take the most recent 4 payments
  return payments.slice(0, 4).map(payment => {
    // Map the payment status to the required TransactionStatus type
    let status: TransactionStatus;
    if (payment.status === "concluido") {
      status = "completed";
    } else if (payment.status === "pendente") {
      status = "pending";
    } else {
      status = "failed";
    }

    return {
      id: payment.id.toString(),
      name: payment.atendente?.nome || "Não atribuído",
      type: payment.tipo === "pix" ? "PIX" : "Boleto",
      amount: `R$ ${formatBrazilianCurrency(payment.valor)}`,
      status,
      date: format(new Date(payment.data), "dd/MM/yyyy", { locale: ptBR })
    };
  });
}

// Format recent expenses for display
export function formatRecentExpenses(expenses: any[]) {
  // Take the most recent 4 expenses
  return expenses.slice(0, 4).map(expense => ({
    id: expense.id.toString(),
    name: expense.responsavel?.nome || expense.descricao,
    type: "Despesa",
    amount: `R$ ${formatBrazilianCurrency(expense.valor)}`,
    status: "completed" as TransactionStatus, // Explicitly type as TransactionStatus
    date: format(new Date(expense.data), "dd/MM/yyyy", { locale: ptBR })
  }));
}
