
import { useState } from "react";
import { Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RecebimentoForm } from "./RecebimentoForm";
import { useUpdateRecebimento } from "@/hooks/useRecebimentos";
import { Recebimento } from "@/hooks/useRecebimentos";

interface EditRecebimentoDialogProps {
  recebimento: Recebimento;
}

export function EditRecebimentoDialog({ recebimento }: EditRecebimentoDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: updateRecebimento } = useUpdateRecebimento();

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      
      const recebimentoData = {
        id: recebimento.id,
        data: values.data,
        valor: values.valor,
        id_tripeiro: parseInt(values.id_tripeiro),
        id_responsavel: values.id_responsavel ? parseInt(values.id_responsavel) : undefined,
        banco: values.conta_info?.banco || values.banco,
        conta_depositada: values.conta_info?.conta || values.conta_depositada,
        tipo_deposito: values.tipo_deposito,
        numero_comprovante: values.numero_comprovante,
        observacoes: values.observacoes,
      };

      await updateRecebimento(recebimentoData);
      setOpen(false);
    } catch (error) {
      console.error("Error updating recebimento:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultValues = {
    data: new Date(recebimento.data),
    valor: Number(recebimento.valor),
    id_tripeiro: recebimento.id_tripeiro.toString(),
    id_responsavel: recebimento.id_responsavel?.toString(),
    banco: recebimento.banco,
    conta_depositada: recebimento.conta_depositada,
    tipo_deposito: recebimento.tipo_deposito || "deposito",
    numero_comprovante: recebimento.numero_comprovante,
    observacoes: recebimento.observacoes,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Recebimento</DialogTitle>
        </DialogHeader>
        <RecebimentoForm 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
          defaultValues={defaultValues}
        />
      </DialogContent>
    </Dialog>
  );
}
