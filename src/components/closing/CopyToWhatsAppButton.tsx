
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink } from "lucide-react";
import { ClosingSummary, TripeiroSummary, AttendantSummary } from "@/hooks/useClosingData";
import { DateRange } from "@/types/payment.types";
import { formatClosingForWhatsApp } from "@/utils/formatClosingForWhatsApp";
import { toast } from "@/hooks/use-toast";
import { Expense } from "@/hooks/expenses/useExpensesQuery";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface CopyToWhatsAppButtonProps {
  closingSummary: ClosingSummary;
  tripeiroSummaries: TripeiroSummary[];
  attendantSummaries: AttendantSummary[];
  dateRange: DateRange;
  expenses: Expense[];
  isLoading: boolean;
}

export function CopyToWhatsAppButton({
  closingSummary,
  tripeiroSummaries,
  attendantSummaries,
  dateRange,
  expenses,
  isLoading
}: CopyToWhatsAppButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const copyToClipboard = async () => {
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

  const openWhatsApp = () => {
    const formattedText = formatClosingForWhatsApp(
      closingSummary,
      tripeiroSummaries,
      attendantSummaries,
      dateRange,
      expenses
    );
    
    window.open(`https://wa.me/?text=${encodeURIComponent(formattedText)}`, '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="gap-2"
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
              WhatsApp
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={copyToClipboard}>
          <Copy className="h-4 w-4 mr-2" />
          <span>Copiar para área de transferência</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openWhatsApp}>
          <ExternalLink className="h-4 w-4 mr-2" />
          <span>Abrir no WhatsApp</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
