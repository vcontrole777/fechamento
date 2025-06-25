
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RecebimentoForm } from "./RecebimentoForm";
import { useAddRecebimento } from "@/hooks/useRecebimentos";

interface NovoRecebimentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovoRecebimentoDialog({ open, onOpenChange }: NovoRecebimentoDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: addRecebimento } = useAddRecebimento();

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      
      const recebimentoData = {
        data: values.data,
        valor: values.valor,
        valores_massa: values.valores_massa,
        id_tripeiro: parseInt(values.id_tripeiro),
        id_responsavel: values.id_responsavel ? parseInt(values.id_responsavel) : undefined,
        banco: values.conta_info?.banco,
        conta_depositada: values.conta_info?.conta,
        tipo_deposito: values.tipo_deposito,
        numero_comprovante: values.numero_comprovante,
        observacoes: values.observacoes,
      };

      await addRecebimento(recebimentoData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding recebimento:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Recebimento</DialogTitle>
        </DialogHeader>
        <RecebimentoForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
