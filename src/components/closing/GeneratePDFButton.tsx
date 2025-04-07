
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react"; // Changed from FilePdf to FileText
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "@/components/common/DateFilter";
import { ClosingSummary, TripeiroSummary, AttendantSummary } from "@/hooks/useClosingData";
import { Expense } from "@/hooks/expenses/useExpensesQuery";

interface GeneratePDFButtonProps {
  closingSummary: ClosingSummary;
  tripeiroSummaries: TripeiroSummary[];
  attendantSummaries: AttendantSummary[];
  expenses: Expense[];
  dateRange: DateRange;
  isLoading: boolean;
  formatCurrency: (value: number) => string;
}

export function GeneratePDFButton({
  closingSummary,
  tripeiroSummaries,
  attendantSummaries,
  expenses,
  dateRange,
  isLoading,
  formatCurrency,
}: GeneratePDFButtonProps) {
  const [generating, setGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    if (isLoading || !closingSummary) return;

    setGenerating(true);

    try {
      const doc = new jsPDF();
      
      // Add title and date range
      doc.setFontSize(18);
      doc.text("Relatório de Fechamento", 105, 15, { align: "center" });
      
      doc.setFontSize(12);
      const periodText = dateRange.from && dateRange.to 
        ? `Período: ${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} a ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`
        : "Período: Todos os registros";
      doc.text(periodText, 105, 25, { align: "center" });
      
      // Add summary section
      doc.setFontSize(14);
      doc.text("Resumo Financeiro", 15, 40);
      
      const summaryData = [
        ["Faturamento Total", formatCurrency(closingSummary.totalRevenue)],
        ["Comissão Atendentes", formatCurrency(closingSummary.totalAttendantCommission)],
        ["A Receber Tripeiros", formatCurrency(closingSummary.totalTripeiroReceivable)],
        ["Total Despesas", formatCurrency(closingSummary.totalExpenses)],
        ["Lucro Líquido", formatCurrency(closingSummary.netProfit)],
      ];
      
      (doc as any).autoTable({
        startY: 45,
        head: [["Item", "Valor"]],
        body: summaryData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        margin: { left: 15, right: 15 },
      });
      
      // Add Tripeiros section
      const tripeiroEndY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text("Valores a Receber (Tripeiros)", 15, tripeiroEndY);
      
      const tripeiroData = tripeiroSummaries.map(tripeiro => [
        tripeiro.name,
        formatCurrency(tripeiro.receivable),
      ]);
      
      (doc as any).autoTable({
        startY: tripeiroEndY + 5,
        head: [["Tripeiro", "Valor a Receber"]],
        body: tripeiroData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        margin: { left: 15, right: 15 },
      });
      
      // Add Attendants section
      const attendantEndY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text("Comissões (Atendentes)", 15, attendantEndY);
      
      const attendantData = attendantSummaries.map(attendant => [
        attendant.name,
        formatCurrency(attendant.commission),
      ]);
      
      (doc as any).autoTable({
        startY: attendantEndY + 5,
        head: [["Atendente", "Comissão"]],
        body: attendantData,
        theme: "grid",
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        margin: { left: 15, right: 15 },
      });
      
      // Add Expenses section if there are any
      if (expenses && expenses.length > 0) {
        const expensesEndY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text("Despesas", 15, expensesEndY);
        
        const expensesData = expenses.map(expense => [
          format(new Date(expense.data), "dd/MM/yyyy", { locale: ptBR }),
          expense.descricao,
          expense.responsavel,
          formatCurrency(expense.valor),
        ]);
        
        (doc as any).autoTable({
          startY: expensesEndY + 5,
          head: [["Data", "Descrição", "Responsável", "Valor"]],
          body: expensesData,
          theme: "grid",
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          margin: { left: 15, right: 15 },
        });
      }
      
      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          `Página ${i} de ${pageCount} - Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: "center" }
        );
      }
      
      // Save the PDF
      doc.save(`Fechamento_${format(new Date(), "yyyy-MM-dd_HH-mm", { locale: ptBR })}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button 
      onClick={handleGeneratePDF} 
      variant="outline" 
      disabled={isLoading || generating}
    >
      <FileText className="mr-2 h-4 w-4" />
      {generating ? "Gerando..." : "Gerar PDF"}
    </Button>
  );
}
