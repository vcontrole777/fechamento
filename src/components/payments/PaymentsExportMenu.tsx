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
import { Payment, PaymentFilters } from "@/types/payment.types";
import { formatPaymentsForWhatsApp } from "@/utils/formatPaymentsForWhatsApp";
import { toast } from "@/hooks/use-toast";

interface PaymentsExportMenuProps {
  payments: Payment[];
  filters: PaymentFilters;
  dateRange: DateRange;
  isLoading: boolean;
  formatCurrency: (value: number) => string;
}

export function PaymentsExportMenu({
  payments,
  filters,
  dateRange,
  isLoading,
  formatCurrency,
}: PaymentsExportMenuProps) {
  const [generating, setGenerating] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const hasActiveFilters = filters.attendantIds.length > 0 || filters.tripeiroIds.length > 0;

  const handleGeneratePDF = async () => {
    if (isLoading || payments.length === 0) return;

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
      doc.text("RELATÓRIO DE PAGAMENTOS", 105, 15, { align: "center" });
      
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
      
      // Calculate totals
      const totalPayments = payments.reduce((sum, p) => sum + Number(p.valor), 0);
      const totalAttendantCommission = payments.reduce((sum, p) => {
        const paymentValue = Number(p.valor);
        const tripeiroPercentage = p.tripeiro?.porcentagem || p.porcentagem_tripeiro;
        const attendantPercentage = p.atendente?.porcentagem || p.porcentagem_atendente;
        const tripeiroCommission = paymentValue * (tripeiroPercentage / 100);
        const tripeiroReceivable = paymentValue - tripeiroCommission;
        return sum + (tripeiroReceivable * (attendantPercentage / 100));
      }, 0);
      const totalTripeiroReceivable = payments.reduce((sum, p) => {
        const paymentValue = Number(p.valor);
        const tripeiroPercentage = p.tripeiro?.porcentagem || p.porcentagem_tripeiro;
        const tripeiroCommission = paymentValue * (tripeiroPercentage / 100);
        return sum + (paymentValue - tripeiroCommission);
      }, 0);
      
      // Add summary section
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text("📊 RESUMO FINANCEIRO", 15, 45);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      
      const summaryData = [
        ["Total de Pagamentos", formatCurrency(totalPayments)],
        ["Comissão Atendentes", formatCurrency(totalAttendantCommission)],
        ["A Receber Tripeiros", formatCurrency(totalTripeiroReceivable)],
        ["Quantidade de Pagamentos", payments.length.toString()],
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
      
      // Add payments table
      const paymentsEndY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(41, 128, 185);
      doc.text("💰 DETALHAMENTO DE PAGAMENTOS", 15, paymentsEndY);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'normal');
      
      const paymentsData = payments.map(payment => [
        format(new Date(payment.data), "dd/MM/yyyy", { locale: ptBR }),
        payment.atendente?.nome || "N/A",
        payment.tripeiro?.nome || "N/A",
        formatCurrency(Number(payment.valor)),
        payment.status === "concluido" ? "✓ Concluído" : payment.status === "pendente" ? "⏳ Pendente" : "⛔ Bloqueado",
      ]);
      
      (doc as any).autoTable({
        startY: paymentsEndY + 5,
        head: [["Data", "Atendente", "Tripeiro", "Valor", "Status"]],
        body: paymentsData,
        theme: "striped",
        headStyles: { 
          fillColor: [41, 128, 185], 
          textColor: 255,
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'center' },
          1: { cellWidth: 45 },
          2: { cellWidth: 45 },
          3: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
          4: { cellWidth: 30, halign: 'center' }
        },
        margin: { left: 15, right: 15 },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        }
      });
      
      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(0.5);
        doc.line(15, doc.internal.pageSize.height - 15, 195, doc.internal.pageSize.height - 15);
        
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
      doc.save(`Pagamentos_${format(new Date(), "yyyy-MM-dd_HH-mm", { locale: ptBR })}.pdf`);
      
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
      const formattedText = formatPaymentsForWhatsApp(payments, hasActiveFilters ? 'atendente' : 'tripeiro');

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
    const formattedText = formatPaymentsForWhatsApp(payments, hasActiveFilters ? 'atendente' : 'tripeiro');

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(formattedText)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleExportCSV = () => {
    try {
      // Header com BOM para UTF-8
      let csv = "\uFEFF";
      csv += "RELATÓRIO DE PAGAMENTOS\n";
      csv += "=".repeat(80) + "\n\n";
      
      // Período e data de geração
      if (dateRange.from && dateRange.to) {
        csv += `Período:,${format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })},até,${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}\n`;
      } else {
        csv += "Período:,Todos os registros\n";
      }
      csv += `Gerado em:,${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}\n\n`;
      csv += "=".repeat(80) + "\n\n";
      
      // Resumo
      const totalPayments = payments.reduce((sum, p) => sum + Number(p.valor), 0);
      const totalAttendantCommission = payments.reduce((sum, p) => {
        const paymentValue = Number(p.valor);
        const tripeiroPercentage = p.tripeiro?.porcentagem || p.porcentagem_tripeiro;
        const attendantPercentage = p.atendente?.porcentagem || p.porcentagem_atendente;
        const tripeiroCommission = paymentValue * (tripeiroPercentage / 100);
        const tripeiroReceivable = paymentValue - tripeiroCommission;
        return sum + (tripeiroReceivable * (attendantPercentage / 100));
      }, 0);
      const totalTripeiroReceivable = payments.reduce((sum, p) => {
        const paymentValue = Number(p.valor);
        const tripeiroPercentage = p.tripeiro?.porcentagem || p.porcentagem_tripeiro;
        const tripeiroCommission = paymentValue * (tripeiroPercentage / 100);
        return sum + (paymentValue - tripeiroCommission);
      }, 0);
      
      csv += "RESUMO FINANCEIRO\n";
      csv += "-".repeat(80) + "\n";
      csv += "Item,Valor\n";
      csv += `Total de Pagamentos,${formatCurrency(totalPayments)}\n`;
      csv += `Comissão Atendentes,${formatCurrency(totalAttendantCommission)}\n`;
      csv += `A Receber Tripeiros,${formatCurrency(totalTripeiroReceivable)}\n`;
      csv += `Quantidade de Pagamentos,${payments.length}\n\n`;
      csv += "=".repeat(80) + "\n\n";
      
      // Pagamentos detalhados
      csv += "DETALHAMENTO DE PAGAMENTOS\n";
      csv += "-".repeat(80) + "\n";
      csv += "Data,Atendente,Tripeiro,Valor,Status\n";
      payments.forEach(payment => {
        const status = payment.status === "concluido" ? "Concluído" : payment.status === "pendente" ? "Pendente" : "Bloqueado";
        csv += `${format(new Date(payment.data), "dd/MM/yyyy", { locale: ptBR })},"${payment.atendente?.nome || "N/A"}","${payment.tripeiro?.nome || "N/A"}",${formatCurrency(Number(payment.valor))},"${status}"\n`;
      });
      csv += `\n,,TOTAL,${formatCurrency(totalPayments)}\n\n`;
      csv += "=".repeat(80) + "\n";
      
      // Criar e baixar arquivo
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `Pagamentos_${format(new Date(), "yyyy-MM-dd_HH-mm", { locale: ptBR })}.csv`);
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

  if (!payments || payments.length === 0) {
    return null;
  }

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
