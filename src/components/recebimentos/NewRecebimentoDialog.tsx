
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecebimentoForm } from "./RecebimentoForm";
import { useAddRecebimento } from "./hooks/useAddRecebimento";

interface NewRecebimentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewRecebimentoDialog({ open, onOpenChange }: NewRecebimentoDialogProps) {
  const { mutate: addRecebimento, isPending } = useAddRecebimento();

  const handleSubmit = (data: any) => {
    addRecebimento(data, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Recebimento</DialogTitle>
        </DialogHeader>
        <RecebimentoForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
