
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
  // Format currency in Brazilian style (R$ 1.000,00)
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Format the date range
  const dateRangeFormatted = dateRange.from && dateRange.to
    ? `${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} a ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`
    : dateRange.from
      ? `A partir de ${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })}`
      : dateRange.to
        ? `Até ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`
        : "Período completo";

  // Start composing the message
  let whatsappText = `📊 *RELATÓRIO DE FECHAMENTO* 📊\n`;
  whatsappText += `*Período:* ${dateRangeFormatted}\n\n`;
  
  // Add summary data
  whatsappText += `*RESUMO*\n`;
  whatsappText += `Faturamento Total: ${formatCurrency(closingSummary.totalRevenue)}\n`;
  whatsappText += `Comissão Atendentes: ${formatCurrency(closingSummary.totalAttendantCommission)}\n`;
  whatsappText += `Comissão Tripeiros: ${formatCurrency(closingSummary.totalTripeiroCommission)}\n`;
  whatsappText += `Despesas: ${formatCurrency(closingSummary.totalExpenses)}\n`;
  whatsappText += `*Lucro Líquido: ${formatCurrency(closingSummary.netProfit)}*\n\n`;
  
  // Add tripeiro data
  if (tripeiroSummaries.length > 0) {
    // Calculate total payments value - this is the full amount before tripeiro commission
    const totalPaymentsValue = tripeiroSummaries.reduce((total, tripeiro) => {
      const tripeiroPercentage = tripeiro.porcentagemDecimal;
      // This calculates the original total payment before the tripeiro's commission was taken
      // We use: receivable = total - (total * percentage)
      // Solve for total: total = receivable / (1 - percentage)
      const originalPaymentValue = tripeiro.totalReceivable / (1 - tripeiroPercentage);
      return total + originalPaymentValue;
    }, 0);
    
    // Calculate total receivable for all tripeiros
    const totalReceivable = tripeiroSummaries.reduce((acc, tripeiro) => acc + tripeiro.totalReceivable, 0);
    const totalPayments = tripeiroSummaries.reduce((acc, tripeiro) => acc + tripeiro.paymentsCount, 0);
    
    whatsappText += `*VALORES A RECEBER (TRIPEIROS)*\n`;
    tripeiroSummaries.forEach((tripeiro) => {
      // Calculate the total payment value for this tripeiro
      const tripeiroPercentage = tripeiro.porcentagemDecimal;
      const originalPaymentValue = tripeiro.totalReceivable / (1 - tripeiroPercentage);
      
      whatsappText += `${tripeiro.nome}: ${formatCurrency(originalPaymentValue)} → A receber: ${formatCurrency(tripeiro.totalReceivable)} (${tripeiro.paymentsCount} pagamentos)\n`;
    });
    whatsappText += `*TOTAL: ${formatCurrency(totalPaymentsValue)}* (${totalPayments} pagamentos)\n\n`;
  }
  
  // Add attendant data
  if (attendantSummaries.length > 0) {
    // Calculate total payment value for attendants - this is after tripeiro's commission
    const totalPaymentsAfterTripeiro = attendantSummaries.reduce((total, attendant) => {
      const attendantPercentage = attendant.porcentagemDecimal;
      // This calculates what the payment was before the attendant's commission
      // We use: commission = paymentAfterTripeiro * percentage
      // So: paymentAfterTripeiro = commission / percentage
      const paymentAfterTripeiro = attendant.totalCommission / attendantPercentage;
      return total + paymentAfterTripeiro;
    }, 0);
    
    // Calculate total commission for all attendants
    const totalCommission = attendantSummaries.reduce((acc, attendant) => acc + attendant.totalCommission, 0);
    const totalPayments = attendantSummaries.reduce((acc, attendant) => acc + attendant.paymentsCount, 0);
    
    whatsappText += `*COMISSÕES (ATENDENTES)*\n`;
    attendantSummaries.forEach((attendant) => {
      // Calculate the total payment value for this attendant
      const attendantPercentage = attendant.porcentagemDecimal;
      const paymentAfterTripeiro = attendant.totalCommission / attendantPercentage;
      
      whatsappText += `${attendant.nome}: ${formatCurrency(paymentAfterTripeiro)} → Comissão: ${formatCurrency(attendant.totalCommission)} (${attendant.paymentsCount} pagamentos)\n`;
    });
    whatsappText += `*TOTAL: ${formatCurrency(totalPaymentsAfterTripeiro)}* (${totalPayments} pagamentos)\n\n`;
  }
  
  // Add expenses data
  if (expenses.length > 0) {
    const totalExpenses = expenses.reduce((acc, expense) => acc + Number(expense.valor), 0);
    
    whatsappText += `*DESPESAS*\n`;
    expenses.forEach((expense) => {
      const responsavelName = expense.responsavel?.nome ? ` (${expense.responsavel.nome})` : '';
      whatsappText += `${format(new Date(expense.data), "dd/MM/yyyy")}: ${formatCurrency(Number(expense.valor))} - ${expense.descricao}${responsavelName}\n`;
    });
    whatsappText += `*TOTAL: ${formatCurrency(totalExpenses)}*\n`;
  }

  return whatsappText;
}
