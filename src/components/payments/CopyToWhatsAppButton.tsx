
import { useState } from "react";
import { Copy, Truck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Payment } from "@/types/payment.types";
import { formatPaymentsForWhatsApp } from "@/utils/formatPaymentsForWhatsApp";

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
  const [isCopiedTripeiro, setIsCopiedTripeiro] = useState(false);
  const [isCopiedAtendente, setIsCopiedAtendente] = useState(false);
  
  if (!isVisible) return null;
  
  const handleCopyToClipboard = async (groupBy: 'tripeiro' | 'atendente') => {
    try {
      // Use the utility function to format the message with the specified grouping
      const formattedText = formatPaymentsForWhatsApp(payments, groupBy);
      
      await navigator.clipboard.writeText(formattedText);
      
      // Update the appropriate copied state
      if (groupBy === 'tripeiro') {
        setIsCopiedTripeiro(true);
        setTimeout(() => setIsCopiedTripeiro(false), 2000);
      } else {
        setIsCopiedAtendente(true);
        setTimeout(() => setIsCopiedAtendente(false), 2000);
      }
      
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

  const openWhatsApp = (groupBy: 'tripeiro' | 'atendente') => {
    const formattedText = encodeURIComponent(formatPaymentsForWhatsApp(payments, groupBy));
    window.open(`https://wa.me/?text=${formattedText}`, '_blank');
  };
  
  // Verifica se existem tripeiros e atendentes nos pagamentos
  const hasTripeiros = payments.some(p => p.tripeiro?.nome);
  const hasAttendants = payments.some(p => p.atendente?.nome);
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {hasTripeiros && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopyToClipboard('tripeiro')}
            className="flex items-center gap-2"
          >
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isCopiedTripeiro ? "Copiado!" : "Copiar Tripeiros"}
            </span>
            <span className="sm:hidden">{isCopiedTripeiro ? "Copiado!" : "Tripeiros"}</span>
          </Button>
        </div>
      )}
      
      {hasAttendants && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopyToClipboard('atendente')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">
              {isCopiedAtendente ? "Copiado!" : "Copiar Atendentes"}
            </span>
            <span className="sm:hidden">{isCopiedAtendente ? "Copiado!" : "Atendentes"}</span>
          </Button>
        </div>
      )}
    </div>
  );
}
