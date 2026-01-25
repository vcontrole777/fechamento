import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Check, X, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface ExtractedValue {
  id: string;
  fileName: string;
  valor: number;
  hash: string;
}

interface ReceiptUploadButtonProps {
  onValueExtracted: (value: number) => void;
  disabled?: boolean;
}

export function ReceiptUploadButton({ onValueExtracted, disabled }: ReceiptUploadButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>("");
  const [extractedValues, setExtractedValues] = useState<ExtractedValue[]>([]);
  const [processedHashes, setProcessedHashes] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const computeHash = async (base64: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(base64);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const processFile = async (base64: string): Promise<number[]> => {
    // Call edge function
    const { data, error } = await supabase.functions.invoke("extract-payment-value", {
      body: { image: base64 },
    });

    if (error) {
      throw error;
    }

    if (data.success && Array.isArray(data.valores) && data.valores.length > 0) {
      return data.valores;
    }
    return [];
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    
    // Validate all files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Arquivo inválido",
          description: `"${file.name}" não é uma imagem válida`,
          variant: "destructive",
        });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: `"${file.name}" excede 10MB`,
          variant: "destructive",
        });
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const newExtractedValues: ExtractedValue[] = [];
    const newHashes = new Set(processedHashes);
    let successCount = 0;
    let failCount = 0;
    let duplicateCount = 0;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setCurrentFile(file.name);
      setProgress(Math.round(((i) / validFiles.length) * 100));

      try {
        // Convert to base64 first to compute hash
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Check for duplicates
        const hash = await computeHash(base64);
        if (newHashes.has(hash) || extractedValues.some(v => v.hash === hash)) {
          duplicateCount++;
          continue;
        }

        const valores = await processFile(base64);
        if (valores.length > 0) {
          valores.forEach((valor, idx) => {
            newExtractedValues.push({
              id: `${Date.now()}-${i}-${idx}`,
              fileName: valores.length > 1 ? `${file.name} (#${idx + 1})` : file.name,
              valor,
              hash: `${hash}-${idx}`,
            });
          });
          newHashes.add(hash);
          successCount += valores.length;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error(`Erro ao processar ${file.name}:`, error);
        failCount++;
      }
    }

    setProcessedHashes(newHashes);

    setProgress(100);
    setIsProcessing(false);
    setCurrentFile("");

    if (newExtractedValues.length > 0) {
      setExtractedValues(prev => [...prev, ...newExtractedValues]);
      const total = newExtractedValues.reduce((sum, v) => sum + v.valor, 0);
      toast({
        title: `${successCount} comprovante${successCount > 1 ? 's' : ''} processado${successCount > 1 ? 's' : ''}`,
        description: `Total detectado: R$ ${total.toFixed(2)}. Confirme os valores abaixo.`,
      });
    }

    if (failCount > 0) {
      toast({
        title: "Alguns comprovantes não foram processados",
        description: `${failCount} imagem${failCount > 1 ? 'ns' : ''} não teve${failCount > 1 ? 'ram' : ''} o valor identificado.`,
        variant: "destructive",
      });
    }

    if (duplicateCount > 0) {
      toast({
        title: "Comprovantes duplicados ignorados",
        description: `${duplicateCount} imagem${duplicateCount > 1 ? 'ns já foram enviadas' : ' já foi enviada'} anteriormente.`,
        variant: "default",
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmSingle = (extracted: ExtractedValue) => {
    onValueExtracted(extracted.valor);
    setExtractedValues(prev => prev.filter(v => v.id !== extracted.id));
    toast({
      title: "Valor aplicado",
      description: `R$ ${extracted.valor.toFixed(2)} foi preenchido no campo.`,
    });
  };

  const handleConfirmAll = () => {
    const total = extractedValues.reduce((sum, v) => sum + v.valor, 0);
    onValueExtracted(total);
    setExtractedValues([]);
    toast({
      title: "Valor total aplicado",
      description: `R$ ${total.toFixed(2)} foi preenchido no campo.`,
    });
  };

  const handleRejectSingle = (id: string) => {
    setExtractedValues(prev => prev.filter(v => v.id !== id));
  };

  const handleRejectAll = () => {
    setExtractedValues([]);
  };

  const totalExtracted = extractedValues.reduce((sum, v) => sum + v.valor, 0);

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
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
            Analisando: {currentFile}
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Enviar comprovantes (PIX/Depósito)
          </>
        )}
      </Button>

      {isProcessing && (
        <Progress value={progress} className="h-1" />
      )}

      {extractedValues.length > 0 && (
        <div className="space-y-2">
          {extractedValues.length > 1 && (
            <Alert className="border-primary bg-primary/5">
              <AlertDescription className="flex items-center justify-between">
                <span>
                  <strong>Total ({extractedValues.length} comprovantes):</strong>{" "}
                  <span className="text-primary font-semibold">R$ {totalExtracted.toFixed(2)}</span>
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleConfirmAll}
                    className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-100"
                    title="Usar valor total"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleRejectAll}
                    className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
                    title="Descartar todos"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {extractedValues.map((extracted) => (
            <Alert key={extracted.id} className="border-muted">
              <AlertDescription className="flex items-center justify-between text-sm">
                <span className="truncate max-w-[180px]" title={extracted.fileName}>
                  {extracted.fileName}: <strong className="text-primary">R$ {extracted.valor.toFixed(2)}</strong>
                </span>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleConfirmSingle(extracted)}
                    className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-100"
                    title="Usar este valor"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRejectSingle(extracted.id)}
                    className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
                    title="Descartar"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}
