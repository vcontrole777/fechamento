
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContaBancariaForm } from "./ContaBancariaForm";
import { useUpdateContaBancaria } from "./hooks/useUpdateContaBancaria";
import { ContaBancaria } from "@/types/conta-bancaria.types";

interface EditContaBancariaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conta: ContaBancaria;
}

export function EditContaBancariaDialog({ 
  open, 
  onOpenChange, 
  conta 
}: EditContaBancariaDialogProps) {
  const { mutate: updateContaBancaria, isPending } = useUpdateContaBancaria();

  const handleSubmit = (data: any) => {
    updateContaBancaria({ id: conta.id, updates: data }, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Conta Bancária</DialogTitle>
        </DialogHeader>
        <ContaBancariaForm
          initialData={conta}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
