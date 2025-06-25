
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContaBancariaForm } from "./ContaBancariaForm";
import { useAddContaBancaria } from "@/hooks/useContasBancarias";

interface NovaContaBancariaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovaContaBancariaDialog({ open, onOpenChange }: NovaContaBancariaDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: addConta } = useAddContaBancaria();

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      await addConta(values);
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding conta bancaria:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Conta Bancária</DialogTitle>
        </DialogHeader>
        <ContaBancariaForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
}
