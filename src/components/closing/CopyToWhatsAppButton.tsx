
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { ClosingSummary, TripeiroSummary, AttendantSummary } from "@/hooks/useClosingData";
import { DateRange } from "@/types/payment.types";
import { formatClosingForWhatsApp } from "@/utils/formatClosingForWhatsApp";
import { toast } from "@/hooks/use-toast";

interface CopyToWhatsAppButtonProps {
  closingSummary: ClosingSummary;
  tripeiroSummaries: TripeiroSummary[];
  attendantSummaries: AttendantSummary[];
  dateRange: DateRange;
  isLoading: boolean;
}

export function CopyToWhatsAppButton({
  closingSummary,
  tripeiroSummaries,
  attendantSummaries,
  dateRange,
  isLoading
}: CopyToWhatsAppButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      const formattedText = formatClosingForWhatsApp(
        closingSummary,
        tripeiroSummaries,
        attendantSummaries,
        dateRange
      );
      
      await navigator.clipboard.writeText(formattedText);
      
      setHasCopied(true);
      toast({
        title: "Copiado!",
        description: "Texto formatado copiado para a área de transferência."
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setHasCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Erro ao copiar para a área de transferência:", error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      className="gap-2"
      onClick={copyToClipboard}
      disabled={isLoading}
    >
      {hasCopied ? (
        <>
          <Check className="h-4 w-4" />
          Copiado!
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copiar para WhatsApp
        </>
      )}
    </Button>
  );
}
