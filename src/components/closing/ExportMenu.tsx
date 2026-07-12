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
      
      // Header with background color
      doc.setFillColor(41, 128, 185);
      doc.rect(0, 0, 210, 35, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont(undefined, 'bold');
      doc.text("RELATÓRIO DE FECHAMENTO", 105, 15, { align: "center" });
      
      // Period
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      const periodText = dateRange.from && dateRange.to 
        ? `Período: ${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })} a ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`
        : "Período: Todos os registros";
      doc.text(periodText, 105, 23, { align: "center" });
      
      // Generation date
      doc.setFontSize(9);
      doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 105, 30, { align: "center" });
      
      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Add summary section with better styling
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text("📊 RESUMO FINANCEIRO", 15, 45);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      
      const summaryData = [
        ["Faturamento Total", formatCurrency(closingSummary.totalRevenue)],
        ["Comissão Atendentes", formatCurrency(closingSummary.totalAttendantCommission)],
        ["A Receber Tripeiros", formatCurrency(closingSummary.totalTripeiroCommission)],
        ["Total Despesas", formatCurrency(closingSummary.totalExpenses)],
        ["Lucro Líquido", formatCurrency(closingSummary.netProfit)],
      ];
      
      (doc as any).autoTable({
        startY: 50,
        head: [["Item", "Valor"]],
        body: summaryData,
        theme: "striped",
        headStyles: { 
          fillColor: [41, 128, 185], 
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 120, fontStyle: 'bold' },
          1: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold', textColor: [41, 128, 185] }
        },
        margin: { left: 15, right: 15 },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        }
      });
      
      // Add Tripeiros section with better styling
      const tripeiroEndY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text("💰 VALORES A RECEBER (TRIPEIROS)", 15, tripeiroEndY);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      
      const tripeiroData = tripeiroSummaries.map(tripeiro => [
        tripeiro.nome,
        formatCurrency(tripeiro.totalReceivable),
      ]);
      
      (doc as any).autoTable({
        startY: tripeiroEndY + 5,
        head: [["Tripeiro", "Valor a Receber"]],
        body: tripeiroData,
        theme: "striped",
        headStyles: { 
          fillColor: [46, 204, 113], 
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { halign: 'right', textColor: [46, 204, 113], fontStyle: 'bold' }
        },
        margin: { left: 15, right: 15 },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        }
      });
      
      // Add Attendants section with better styling
      const attendantEndY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text("👥 COMISSÕES (ATENDENTES)", 15, attendantEndY);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      
      const attendantData = attendantSummaries.map(attendant => [
        attendant.nome,
        formatCurrency(attendant.totalCommission),
      ]);
      
      (doc as any).autoTable({
        startY: attendantEndY + 5,
        head: [["Atendente", "Comissão"]],
        body: attendantData,
        theme: "striped",
        headStyles: { 
          fillColor: [230, 126, 34], 
          textColor: 255,
          fontSize: 11,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { halign: 'right', textColor: [230, 126, 34], fontStyle: 'bold' }
        },
        margin: { left: 15, right: 15 },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        }
      });
      
      // Add Expenses section if there are any with better styling
      if (expenses && expenses.length > 0) {
        const expensesEndY = (doc as any).lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(41, 128, 185);
        doc.text("💸 DESPESAS", 15, expensesEndY);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        
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
          theme: "striped",
          headStyles: { 
            fillColor: [231, 76, 60], 
            textColor: 255,
            fontSize: 11,
            fontStyle: 'bold'
          },
          bodyStyles: {
            fontSize: 9,
          },
          columnStyles: {
            0: { cellWidth: 25, halign: 'center' },
            1: { cellWidth: 70 },
            2: { cellWidth: 50 },
            3: { halign: 'right', textColor: [231, 76, 60], fontStyle: 'bold' }
          },
          margin: { left: 15, right: 15 },
          alternateRowStyles: {
            fillColor: [245, 247, 250]
          }
        });
      }
      
      // Add footer with better styling
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Footer line
        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(0.5);
        doc.line(15, doc.internal.pageSize.height - 15, 195, doc.internal.pageSize.height - 15);
        
        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Página ${i} de ${pageCount}`,
          15,
          doc.internal.pageSize.height - 10
        );
        doc.text(
          `Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`,
          195,
          doc.internal.pageSize.height - 10,
          { align: "right" }
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
      // Header com BOM para UTF-8
      let csv = "\uFEFF";
      csv += "RELATÓRIO DE FECHAMENTO\n";
      csv += "=".repeat(80) + "\n\n";
      
      // Período e data de geração
      if (dateRange.from && dateRange.to) {
        csv += `Período:,${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })},até,${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}\n`;
      } else {
        csv += "Período:,Todos os registros\n";
      }
      csv += `Gerado em:,${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}\n\n`;
      csv += "=".repeat(80) + "\n\n";
      
      // Resumo Financeiro
      csv += "RESUMO FINANCEIRO\n";
      csv += "-".repeat(80) + "\n";
      csv += "Item,Valor\n";
      csv += `Faturamento Total,${formatCurrency(closingSummary.totalRevenue)}\n`;
      csv += `Comissão Atendentes,${formatCurrency(closingSummary.totalAttendantCommission)}\n`;
      csv += `A Receber Tripeiros,${formatCurrency(closingSummary.totalTripeiroCommission)}\n`;
      csv += `Total Despesas,${formatCurrency(closingSummary.totalExpenses)}\n`;
      csv += `Lucro Líquido,${formatCurrency(closingSummary.netProfit)}\n\n`;
      csv += "=".repeat(80) + "\n\n";
      
      // Tripeiros
      csv += "VALORES A RECEBER (TRIPEIROS)\n";
      csv += "-".repeat(80) + "\n";
      csv += "Tripeiro,Valor a Receber\n";
      tripeiroSummaries.forEach(tripeiro => {
        csv += `"${tripeiro.nome}",${formatCurrency(tripeiro.totalReceivable)}\n`;
      });
      const totalTripeiros = tripeiroSummaries.reduce((sum, t) => sum + t.totalReceivable, 0);
      csv += `TOTAL,${formatCurrency(totalTripeiros)}\n\n`;
      csv += "=".repeat(80) + "\n\n";
      
      // Atendentes
      csv += "COMISSÕES (ATENDENTES)\n";
      csv += "-".repeat(80) + "\n";
      csv += "Atendente,Comissão\n";
      attendantSummaries.forEach(attendant => {
        csv += `"${attendant.nome}",${formatCurrency(attendant.totalCommission)}\n`;
      });
      const totalAtendentes = attendantSummaries.reduce((sum, a) => sum + a.totalCommission, 0);
      csv += `TOTAL,${formatCurrency(totalAtendentes)}\n\n`;
      csv += "=".repeat(80) + "\n\n";
      
      // Despesas
      if (expenses && expenses.length > 0) {
        csv += "DESPESAS\n";
        csv += "-".repeat(80) + "\n";
        csv += "Data,Descrição,Responsável,Valor\n";
        expenses.forEach(expense => {
          csv += `${format(new Date(expense.data), "dd/MM/yyyy", { locale: ptBR })},"${expense.descricao}","${expense.responsavel}",${formatCurrency(expense.valor)}\n`;
        });
        const totalDespesas = expenses.reduce((sum, e) => sum + e.valor, 0);
        csv += `,,TOTAL,${formatCurrency(totalDespesas)}\n\n`;
        csv += "=".repeat(80) + "\n";
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
