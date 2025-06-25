
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContaBancariaForm } from "./ContaBancariaForm";
import { useAddContaBancaria } from "./hooks/useAddContaBancaria";

interface NewContaBancariaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewContaBancariaDialog({ open, onOpenChange }: NewContaBancariaDialogProps) {
  const { mutate: addContaBancaria, isPending } = useAddContaBancaria();

  const handleSubmit = (data: any) => {
    addContaBancaria(data, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Conta Bancária</DialogTitle>
        </DialogHeader>
        <ContaBancariaForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
