import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ReceiptUploadButtonProps {
  onValueExtracted: (value: number) => void;
  disabled?: boolean;
}

export function ReceiptUploadButton({ onValueExtracted, disabled }: ReceiptUploadButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestedValue, setSuggestedValue] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem (PNG, JPG, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setSuggestedValue(null);

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call edge function
      const { data, error } = await supabase.functions.invoke("extract-payment-value", {
        body: { image: base64 },
      });

      if (error) {
        throw error;
      }

      if (data.success && data.valor) {
        setSuggestedValue(data.valor);
        toast({
          title: "Valor detectado!",
          description: `Encontramos R$ ${data.valor.toFixed(2)}. Confirme para usar este valor.`,
        });
      } else {
        toast({
          title: "Não foi possível extrair o valor",
          description: data.error || "Tente outra imagem ou insira o valor manualmente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao processar comprovante:", error);
      toast({
        title: "Erro ao processar",
        description: "Ocorreu um erro ao analisar a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleConfirm = () => {
    if (suggestedValue !== null) {
      onValueExtracted(suggestedValue);
      setSuggestedValue(null);
      toast({
        title: "Valor aplicado",
        description: `R$ ${suggestedValue.toFixed(2)} foi preenchido no campo.`,
      });
    }
  };

  const handleReject = () => {
    setSuggestedValue(null);
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isProcessing}
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled || isProcessing}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analisando comprovante...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Enviar comprovante (PIX/Depósito)
          </>
        )}
      </Button>

      {suggestedValue !== null && (
        <Alert className="border-primary bg-primary/5">
          <AlertDescription className="flex items-center justify-between">
            <span>
              Valor detectado: <strong className="text-primary">R$ {suggestedValue.toFixed(2)}</strong>
            </span>
            <div className="flex gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleConfirm}
                className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-100"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleReject}
                className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
