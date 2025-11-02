
import { ClosingSummary, TripeiroSummary, AttendantSummary } from "@/hooks/useClosingData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "@/types/payment.types";
import { Expense } from "@/hooks/expenses/useExpensesQuery";

export function formatClosingForWhatsApp(
  closingSummary: ClosingSummary,
  tripeiroSummaries: TripeiroSummary[],
  attendantSummaries: AttendantSummary[],
  dateRange: DateRange,
  expenses: Expense[] = []
): string {
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  let message = `╔═══════════════════════════╗\n`;
  message += `║   📊 *RELATÓRIO DE FECHAMENTO*   ║\n`;
  message += `╚═══════════════════════════╝\n\n`;
  
  // Período e data de geração
  if (dateRange.from && dateRange.to) {
    message += `📅 *Período:*\n${formatDate(dateRange.from)} até ${formatDate(dateRange.to)}\n\n`;
  } else {
    message += `📅 *Período:* Todos os registros\n\n`;
  }
  message += `🕐 Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}\n`;
  message += `\n${'━'.repeat(35)}\n\n`;

  // Resumo Financeiro com melhor formatação
  message += `💰 *RESUMO FINANCEIRO*\n\n`;
  message += `┌─────────────────────────────┐\n`;
  message += `│ 💵 Faturamento Total\n`;
  message += `│    *${formatCurrency(closingSummary.totalRevenue)}*\n`;
  message += `├─────────────────────────────┤\n`;
  message += `│ 👥 Comissão Atendentes\n`;
  message += `│    ${formatCurrency(closingSummary.totalAttendantCommission)}\n`;
  message += `├─────────────────────────────┤\n`;
  message += `│ 🤝 A Receber Tripeiros\n`;
  message += `│    ${formatCurrency(closingSummary.totalTripeiroCommission)}\n`;
  message += `├─────────────────────────────┤\n`;
  message += `│ 💸 Total Despesas\n`;
  message += `│    ${formatCurrency(closingSummary.totalExpenses)}\n`;
  message += `├─────────────────────────────┤\n`;
  message += `│ ✨ *LUCRO LÍQUIDO*\n`;
  message += `│    *${formatCurrency(closingSummary.netProfit)}*\n`;
  message += `└─────────────────────────────┘\n`;
  message += `\n${'━'.repeat(35)}\n\n`;
  
  // Valores a Receber (Tripeiros) com melhor formatação
  if (tripeiroSummaries && tripeiroSummaries.length > 0) {
    message += `💰 *VALORES A RECEBER (TRIPEIROS)*\n\n`;
    
    tripeiroSummaries.forEach((tripeiro, index) => {
      message += `${index + 1}. 👤 ${tripeiro.nome}\n`;
      message += `   💵 *${formatCurrency(tripeiro.totalReceivable)}*\n`;
      message += `   📊 ${tripeiro.paymentsCount} pagamento(s)\n\n`;
    });
    
    const totalTripeiros = tripeiroSummaries.reduce((sum, t) => sum + t.totalReceivable, 0);
    const totalPagamentos = tripeiroSummaries.reduce((sum, t) => sum + t.paymentsCount, 0);
    message += `┌─────────────────────────────┐\n`;
    message += `│ 📊 TOTAL: *${formatCurrency(totalTripeiros)}*\n`;
    message += `│ 📝 ${totalPagamentos} pagamento(s)\n`;
    message += `└─────────────────────────────┘\n`;
    message += `\n${'━'.repeat(35)}\n\n`;
  }
  
  // Comissões (Atendentes) com melhor formatação
  if (attendantSummaries && attendantSummaries.length > 0) {
    message += `👥 *COMISSÕES (ATENDENTES)*\n\n`;
    
    attendantSummaries.forEach((attendant, index) => {
      message += `${index + 1}. 👤 ${attendant.nome}\n`;
      message += `   💰 *${formatCurrency(attendant.totalCommission)}*\n`;
      message += `   📊 ${attendant.paymentsCount} pagamento(s)\n\n`;
    });
    
    const totalAtendentes = attendantSummaries.reduce((sum, a) => sum + a.totalCommission, 0);
    const totalPagamentos = attendantSummaries.reduce((sum, a) => sum + a.paymentsCount, 0);
    message += `┌─────────────────────────────┐\n`;
    message += `│ 📊 TOTAL: *${formatCurrency(totalAtendentes)}*\n`;
    message += `│ 📝 ${totalPagamentos} pagamento(s)\n`;
    message += `└─────────────────────────────┘\n`;
    message += `\n${'━'.repeat(35)}\n\n`;
  }
  
  // Despesas com melhor formatação
  if (expenses && expenses.length > 0) {
    message += `💸 *DESPESAS DO PERÍODO*\n\n`;
    
    expenses.forEach((expense, index) => {
      const expenseDate = format(new Date(expense.data), "dd/MM/yyyy", { locale: ptBR });
      const responsavelName = expense.responsavel?.nome || expense.responsavel || 'N/A';
      message += `${index + 1}. 📅 ${expenseDate}\n`;
      message += `   📝 ${expense.descricao}\n`;
      message += `   👤 ${responsavelName}\n`;
      message += `   💵 *${formatCurrency(Number(expense.valor))}*\n\n`;
    });
    
    const totalDespesas = expenses.reduce((sum, e) => sum + Number(e.valor), 0);
    message += `┌─────────────────────────────┐\n`;
    message += `│ 📊 TOTAL: *${formatCurrency(totalDespesas)}*\n`;
    message += `└─────────────────────────────┘\n`;
    message += `\n${'━'.repeat(35)}\n\n`;
  }

  message += `╔═══════════════════════════╗\n`;
  message += `║  ✅ Relatório completo gerado  ║\n`;
  message += `╚═══════════════════════════╝\n\n`;
  message += `_${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}_`;

  return message;
}
