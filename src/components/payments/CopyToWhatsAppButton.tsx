
import { Copy, Send } from "lucide-react";
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
  if (!isVisible) return null;
  
  const handleCopyToClipboard = async () => {
    try {
      // Use the utility function to format the message with all selected payments
      const formattedText = formatPaymentsForWhatsApp(payments);
      
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
    const formattedText = encodeURIComponent(formatPaymentsForWhatsApp(payments));
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
