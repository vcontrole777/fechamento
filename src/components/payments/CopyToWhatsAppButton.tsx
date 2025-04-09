
import { Copy, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Payment } from "@/types/payment.types";

interface CopyToWhatsAppButtonProps {
  payments: Payment[];
  isVisible: boolean;
  filters: {
    attendantIds: number[];
    tripeiroIds: number[];
    statuses: string[];
  };
}

export function CopyToWhatsAppButton({ payments, isVisible, filters }: CopyToWhatsAppButtonProps) {
  if (!isVisible) return null;
  
  // Formata os pagamentos de acordo com os filtros aplicados
  const formatPayments = (payments: Payment[]) => {
    const { attendantIds, tripeiroIds } = filters;
    
    // Formata a data de forma legível
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    };
    
    // Formata o valor em reais
    const formatCurrency = (value: number) => {
      return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });
    };
    
    // Define o título baseado nos filtros ativos
    let title = "*Resumo de Pagamentos*\n\n";
    
    if (attendantIds.length > 0 && payments.length > 0) {
      // Filtragem por atendentes
      const attendantName = payments[0].atendente?.nome || "Atendente";
      title = `*Resumo de Pagamentos - ${attendantName}*\n\n`;
      
      // Calcular o total e comissão
      let totalValue = 0;
      let totalCommission = 0;
      
      const formattedPayments = payments.map(payment => {
        const valor = Number(payment.valor);
        const comissao = valor * (payment.porcentagem_atendente / 100);
        
        totalValue += valor;
        totalCommission += comissao;
        
        return `📅 *${formatDate(payment.data)}*\n💰 Valor: ${formatCurrency(valor)}\n💼 Comissão: ${formatCurrency(comissao)}\n`;
      }).join("\n");
      
      return `${title}${formattedPayments}\n*Total:* ${formatCurrency(totalValue)}\n*Comissão Total:* ${formatCurrency(totalCommission)}`;
    } 
    else if (tripeiroIds.length > 0 && payments.length > 0) {
      // Filtragem por tripeiros
      const tripeiroName = payments[0].tripeiro?.nome || "Tripeiro";
      title = `*Resumo de Pagamentos - ${tripeiroName}*\n\n`;
      
      // Calcular o total e valor a receber
      let totalValue = 0;
      let totalReceivable = 0;
      
      const formattedPayments = payments.map(payment => {
        const valor = Number(payment.valor);
        const valorReceber = valor * (payment.porcentagem_tripeiro / 100);
        
        totalValue += valor;
        totalReceivable += valorReceber;
        
        return `📅 *${formatDate(payment.data)}*\n💰 Valor: ${formatCurrency(valor)}\n💵 Valor a Receber: ${formatCurrency(valorReceber)}\n`;
      }).join("\n");
      
      return `${title}${formattedPayments}\n*Total:* ${formatCurrency(totalValue)}\n*Valor Total a Receber:* ${formatCurrency(totalReceivable)}`;
    } 
    else {
      // Sem filtros específicos, formatação padrão
      const formattedPayments = payments.map(payment => {
        return `📅 *${formatDate(payment.data)}*\n💰 Valor: ${formatCurrency(Number(payment.valor))}\n👨‍💼 Atendente: ${payment.atendente?.nome || "N/A"}\n👨‍🍳 Tripeiro: ${payment.tripeiro?.nome || "N/A"}\n`;
      }).join("\n");
      
      return `${title}${formattedPayments}`;
    }
  };
  
  const handleCopyToClipboard = async () => {
    try {
      const formattedText = formatPayments(payments);
      await navigator.clipboard.writeText(formattedText);
      
      toast({
        title: "Copiado com sucesso!",
        description: "Texto formatado copiado para a área de transferência.",
      });
    } catch (error) {
      console.error("Erro ao copiar para área de transferência:", error);
      toast({
        title: "Falha ao copiar",
        description: "Não foi possível copiar o texto para a área de transferência.",
        variant: "destructive",
      });
    }
  };

  const openWhatsApp = () => {
    const formattedText = encodeURIComponent(formatPayments(payments));
    window.open(`https://wa.me/?text=${formattedText}`, '_blank');
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyToClipboard}
        className="flex items-center gap-2"
      >
        <Copy className="h-4 w-4" />
        <span className="hidden sm:inline">Copiar para WhatsApp</span>
        <span className="sm:hidden">Copiar</span>
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={openWhatsApp}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
      >
        <Send className="h-4 w-4" />
        <span className="hidden sm:inline">Enviar pelo WhatsApp</span>
        <span className="sm:hidden">Enviar</span>
      </Button>
    </div>
  );
}
