
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Format recent payments for display
export function formatRecentPayments(payments: any[]) {
  // Take the most recent 4 payments
  return payments.slice(0, 4).map(payment => ({
    id: payment.id.toString(),
    name: payment.atendente?.nome || "Não atribuído",
    type: payment.tipo === "pix" ? "PIX" : "Boleto",
    amount: payment.valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }),
    status: payment.status === "concluido" ? "completed" : 
            payment.status === "pendente" ? "pending" : "failed",
    date: format(new Date(payment.data), "dd/MM/yyyy", { locale: ptBR })
  }));
}

// Format recent expenses for display
export function formatRecentExpenses(expenses: any[]) {
  // Take the most recent 4 expenses
  return expenses.slice(0, 4).map(expense => ({
    id: expense.id.toString(),
    name: expense.responsavel?.nome || expense.descricao,
    type: "Despesa",
    amount: expense.valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }),
    status: "completed",
    date: format(new Date(expense.data), "dd/MM/yyyy", { locale: ptBR })
  }));
}
