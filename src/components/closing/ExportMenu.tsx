import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, MessageCircle, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "@/components/common/date-filter/types";
import { ClosingSummary, TripeiroSummary, AttendantSummary } from "@/hooks/useClosingData";
import { Expense } from "@/hooks/expenses/useExpensesQuery";
import { formatClosingForWhatsApp } from "@/utils/formatClosingForWhatsApp";
import { toast } from "@/hooks/use-toast";

interface ExportMenuProps {
  closingSummary: ClosingSummary;
  tripeiroSummaries: TripeiroSummary[];
  attendantSummaries: AttendantSummary[];
  expenses: Expense[];
  dateRange: DateRange;
  isLoading: boolean;
  formatCurrency: (value: number) => string;
}

export function ExportMenu({
  closingSummary,
  tripeiroSummaries,
  attendantSummaries,
  expenses,
  dateRange,
  isLoading,
  formatCurrency,
}: ExportMenuProps) {
  const [generating, setGenerating] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

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
        ["A Receber Tripeiros", formatCurrency(closingSummary.totalTripeiroCommission)],
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
        tripeiro.nome,
        formatCurrency(tripeiro.totalReceivable),
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
        attendant.nome,
        formatCurrency(attendant.totalCommission),
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
      
      toast({
        title: "PDF gerado com sucesso",
        description: "O arquivo foi baixado automaticamente",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o arquivo",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const formattedText = formatClosingForWhatsApp(
        closingSummary,
        tripeiroSummaries,
        attendantSummaries,
        dateRange,
        expenses
      );

      await navigator.clipboard.writeText(formattedText);
      setHasCopied(true);
      
      toast({
        title: "Copiado!",
        description: "Dados copiados para a área de transferência",
      });

      setTimeout(() => setHasCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar para a área de transferência",
        variant: "destructive",
      });
    }
  };

  const handleOpenWhatsApp = () => {
    const formattedText = formatClosingForWhatsApp(
      closingSummary,
      tripeiroSummaries,
      attendantSummaries,
      dateRange,
      expenses
    );

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(formattedText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleExportCSV = () => {
    try {
      // Criar CSV com todas as informações
      let csv = "Relatório de Fechamento\n\n";
      
      // Período
      if (dateRange.from && dateRange.to) {
        csv += `Período,${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })},${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}\n\n`;
      }
      
      // Resumo
      csv += "Resumo Financeiro\n";
      csv += "Item,Valor\n";
      csv += `Faturamento Total,${formatCurrency(closingSummary.totalRevenue)}\n`;
      csv += `Comissão Atendentes,${formatCurrency(closingSummary.totalAttendantCommission)}\n`;
      csv += `A Receber Tripeiros,${formatCurrency(closingSummary.totalTripeiroCommission)}\n`;
      csv += `Total Despesas,${formatCurrency(closingSummary.totalExpenses)}\n`;
      csv += `Lucro Líquido,${formatCurrency(closingSummary.netProfit)}\n\n`;
      
      // Tripeiros
      csv += "Valores a Receber (Tripeiros)\n";
      csv += "Nome,Valor a Receber\n";
      tripeiroSummaries.forEach(tripeiro => {
        csv += `${tripeiro.nome},${formatCurrency(tripeiro.totalReceivable)}\n`;
      });
      csv += "\n";
      
      // Atendentes
      csv += "Comissões (Atendentes)\n";
      csv += "Nome,Comissão\n";
      attendantSummaries.forEach(attendant => {
        csv += `${attendant.nome},${formatCurrency(attendant.totalCommission)}\n`;
      });
      
      // Despesas
      if (expenses && expenses.length > 0) {
        csv += "\n";
        csv += "Despesas\n";
        csv += "Data,Descrição,Responsável,Valor\n";
        expenses.forEach(expense => {
          csv += `${format(new Date(expense.data), "dd/MM/yyyy", { locale: ptBR })},${expense.descricao},${expense.responsavel},${formatCurrency(expense.valor)}\n`;
        });
      }
      
      // Criar e baixar arquivo
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `Fechamento_${format(new Date(), "yyyy-MM-dd_HH-mm", { locale: ptBR })}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "CSV exportado com sucesso",
        description: "O arquivo foi baixado automaticamente",
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Erro ao exportar CSV",
        description: "Ocorreu um erro ao gerar o arquivo",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          disabled={isLoading || generating}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          {generating ? "Exportando..." : "Exportar"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Exportar dados</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleGeneratePDF} disabled={isLoading || generating}>
          <FileText className="mr-2 h-4 w-4" />
          <div className="flex flex-col">
            <span>Gerar PDF</span>
            <span className="text-xs text-muted-foreground">Relatório completo</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleExportCSV} disabled={isLoading}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          <div className="flex flex-col">
            <span>Exportar CSV</span>
            <span className="text-xs text-muted-foreground">Para planilhas</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleCopyToClipboard} disabled={isLoading}>
          <MessageCircle className="mr-2 h-4 w-4" />
          <div className="flex flex-col">
            <span>{hasCopied ? "Copiado!" : "Copiar texto"}</span>
            <span className="text-xs text-muted-foreground">Para área de transferência</span>
          </div>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleOpenWhatsApp} disabled={isLoading}>
          <MessageCircle className="mr-2 h-4 w-4 text-green-600" />
          <div className="flex flex-col">
            <span>Abrir WhatsApp</span>
            <span className="text-xs text-muted-foreground">Compartilhar direto</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
