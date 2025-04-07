
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FilePdf } from "lucide-react";
import { ClosingSummary, TripeiroSummary, AttendantSummary } from "@/hooks/useClosingData";
import { DateRange } from "@/types/payment.types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { Expense } from "@/hooks/expenses/useExpensesQuery";
import jsPDF from "jspdf";
import "jspdf-autotable";

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

  const generatePDF = async () => {
    try {
      setGenerating(true);
      
      // Create a new PDF document
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      // Format the date range for the report title
      let dateRangeText = "Período não especificado";
      if (dateRange.from) {
        dateRangeText = format(dateRange.from, "dd/MM/yyyy", { locale: ptBR });
        if (dateRange.to && dateRange.to.getTime() !== dateRange.from.getTime()) {
          dateRangeText += ` até ${format(dateRange.to, "dd/MM/yyyy", { locale: ptBR })}`;
        }
      }
      
      // Add title and date range
      doc.setFontSize(22);
      doc.text("Relatório de Fechamento", 105, 20, { align: "center" });
      doc.setFontSize(12);
      doc.text(dateRangeText, 105, 30, { align: "center" });
      
      // Add summary section
      doc.setFontSize(16);
      doc.text("Resumo Financeiro", 20, 45);
      
      const summaryData = [
        ["Faturamento Total", formatCurrency(closingSummary.totalRevenue)],
        ["Comissão Atendentes", formatCurrency(closingSummary.totalAttendantCommission)],
        ["Comissão Tripeiros", formatCurrency(closingSummary.totalTripeiroCommission)],
        ["Despesas", formatCurrency(closingSummary.totalExpenses)],
        ["Lucro Líquido", formatCurrency(closingSummary.netProfit)]
      ];
      
      // Add summary table
      (doc as any).autoTable({
        startY: 50,
        head: [["Item", "Valor"]],
        body: summaryData,
        theme: "grid",
        headStyles: { 
          fillColor: [155, 135, 245],
          textColor: [255, 255, 255],
          fontStyle: "bold"
        },
        styles: { 
          cellPadding: 5,
          fontSize: 10
        },
        columnStyles: {
          0: { cellWidth: 120 },
          1: { cellWidth: 60, halign: "right" }
        }
      });
      
      // Add tripeiros section
      const currentY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(16);
      doc.text("Valores a Receber (Tripeiros)", 20, currentY);
      
      const tripeiroData = tripeiroSummaries.map(tripeiro => [
        tripeiro.nome,
        formatCurrency(tripeiro.totalReceivable),
        `${(tripeiro.porcentagemDecimal * 100).toFixed(0)}%`,
        tripeiro.paymentsCount
      ]);
      
      // Add tripeiros table
      (doc as any).autoTable({
        startY: currentY + 5,
        head: [["Nome", "Valor a Receber", "Comissão", "Pagamentos"]],
        body: tripeiroData,
        theme: "grid",
        headStyles: { 
          fillColor: [155, 135, 245],
          textColor: [255, 255, 255],
          fontStyle: "bold"
        },
        styles: { 
          cellPadding: 5,
          fontSize: 10
        },
        columnStyles: {
          1: { halign: "right" },
          2: { halign: "center" },
          3: { halign: "center" }
        }
      });
      
      // Add attendants section
      const currentY2 = (doc as any).lastAutoTable.finalY + 20;
      
      // Check if we need to add a new page
      if (currentY2 > 250) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text("Comissões (Atendentes)", 20, 20);
        
        const attendantData = attendantSummaries.map(attendant => [
          attendant.nome,
          formatCurrency(attendant.totalCommission),
          `${(attendant.porcentagemDecimal * 100).toFixed(0)}%`,
          attendant.paymentsCount
        ]);
        
        // Add attendants table
        (doc as any).autoTable({
          startY: 25,
          head: [["Nome", "Comissão", "Percentual", "Pagamentos"]],
          body: attendantData,
          theme: "grid",
          headStyles: { 
            fillColor: [155, 135, 245],
            textColor: [255, 255, 255],
            fontStyle: "bold"
          },
          styles: { 
            cellPadding: 5,
            fontSize: 10
          },
          columnStyles: {
            1: { halign: "right" },
            2: { halign: "center" },
            3: { halign: "center" }
          }
        });
      } else {
        doc.setFontSize(16);
        doc.text("Comissões (Atendentes)", 20, currentY2);
        
        const attendantData = attendantSummaries.map(attendant => [
          attendant.nome,
          formatCurrency(attendant.totalCommission),
          `${(attendant.porcentagemDecimal * 100).toFixed(0)}%`,
          attendant.paymentsCount
        ]);
        
        // Add attendants table
        (doc as any).autoTable({
          startY: currentY2 + 5,
          head: [["Nome", "Comissão", "Percentual", "Pagamentos"]],
          body: attendantData,
          theme: "grid",
          headStyles: { 
            fillColor: [155, 135, 245],
            textColor: [255, 255, 255],
            fontStyle: "bold"
          },
          styles: { 
            cellPadding: 5,
            fontSize: 10
          },
          columnStyles: {
            1: { halign: "right" },
            2: { halign: "center" },
            3: { halign: "center" }
          }
        });
      }
      
      // Add expenses section if we have expenses
      if (expenses.length > 0) {
        const currentY3 = (doc as any).lastAutoTable.finalY + 20;
        
        // Check if we need to add a new page
        if (currentY3 > 250) {
          doc.addPage();
          doc.setFontSize(16);
          doc.text("Despesas", 20, 20);
          
          const expensesData = expenses.map(expense => [
            expense.descricao,
            formatCurrency(expense.valor),
            expense.responsavel?.nome || "-",
            format(new Date(expense.data), "dd/MM/yyyy", { locale: ptBR })
          ]);
          
          // Add expenses table
          (doc as any).autoTable({
            startY: 25,
            head: [["Descrição", "Valor", "Responsável", "Data"]],
            body: expensesData,
            theme: "grid",
            headStyles: { 
              fillColor: [155, 135, 245],
              textColor: [255, 255, 255],
              fontStyle: "bold"
            },
            styles: { 
              cellPadding: 5,
              fontSize: 10
            },
            columnStyles: {
              1: { halign: "right" },
              3: { halign: "center" }
            }
          });
        } else {
          doc.setFontSize(16);
          doc.text("Despesas", 20, currentY3);
          
          const expensesData = expenses.map(expense => [
            expense.descricao,
            formatCurrency(expense.valor),
            expense.responsavel?.nome || "-",
            format(new Date(expense.data), "dd/MM/yyyy", { locale: ptBR })
          ]);
          
          // Add expenses table
          (doc as any).autoTable({
            startY: currentY3 + 5,
            head: [["Descrição", "Valor", "Responsável", "Data"]],
            body: expensesData,
            theme: "grid",
            headStyles: { 
              fillColor: [155, 135, 245],
              textColor: [255, 255, 255],
              fontStyle: "bold"
            },
            styles: { 
              cellPadding: 5,
              fontSize: 10
            },
            columnStyles: {
              1: { halign: "right" },
              3: { halign: "center" }
            }
          });
        }
      }
      
      // Add footer with date and page info
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })} | Página ${i} de ${totalPages}`,
          105,
          287,
          { align: "center" }
        );
      }
      
      // Save the PDF with a meaningful name
      const filename = `fechamento_${dateRange.from ? format(dateRange.from, "dd-MM-yyyy", { locale: ptBR }) : 'sem-data'}.pdf`;
      doc.save(filename);
      
      toast({
        title: "PDF gerado com sucesso",
        description: `O arquivo ${filename} foi baixado`,
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o relatório em PDF.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      variant="default"
      onClick={generatePDF}
      disabled={isLoading || generating}
      className="bg-primary text-primary-foreground hover:bg-primary/90"
    >
      <FilePdf className="mr-2 h-4 w-4" />
      {generating ? "Gerando PDF..." : "Gerar PDF"}
    </Button>
  );
}
