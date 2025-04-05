
import { ClosingSummary, TripeiroSummary, AttendantSummary } from "@/hooks/useClosingData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "@/types/payment.types";

export function formatClosingForWhatsApp(
  closingSummary: ClosingSummary,
  tripeiroSummaries: TripeiroSummary[],
  attendantSummaries: AttendantSummary[],
  dateRange: DateRange
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
    whatsappText += `*VALORES A RECEBER (TRIPEIROS)*\n`;
    tripeiroSummaries.forEach((tripeiro) => {
      whatsappText += `${tripeiro.nome}: ${formatCurrency(tripeiro.totalReceivable)} (${tripeiro.paymentsCount} pagamentos)\n`;
    });
    whatsappText += `\n`;
  }
  
  // Add attendant data
  if (attendantSummaries.length > 0) {
    whatsappText += `*COMISSÕES (ATENDENTES)*\n`;
    attendantSummaries.forEach((attendant) => {
      whatsappText += `${attendant.nome}: ${formatCurrency(attendant.totalCommission)} (${attendant.paymentsCount} pagamentos)\n`;
    });
  }

  return whatsappText;
}
