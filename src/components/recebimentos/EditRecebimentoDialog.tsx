
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecebimentoForm } from "./RecebimentoForm";
import { useUpdateRecebimento } from "./hooks/useUpdateRecebimento";
import { Recebimento } from "@/types/recebimento.types";

interface EditRecebimentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recebimento: Recebimento;
}

export function EditRecebimentoDialog({ 
  open, 
  onOpenChange, 
  recebimento 
}: EditRecebimentoDialogProps) {
  const { mutate: updateRecebimento, isPending } = useUpdateRecebimento();

  const handleSubmit = (data: any) => {
    updateRecebimento({ id: recebimento.id, updates: data }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Recebimento</DialogTitle>
        </DialogHeader>
        <RecebimentoForm
          initialData={recebimento}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
