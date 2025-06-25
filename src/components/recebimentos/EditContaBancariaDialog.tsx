
import { useState } from "react";
import { Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ContaBancariaForm } from "./ContaBancariaForm";
import { ContaBancaria, useUpdateContaBancaria } from "@/hooks/useContasBancarias";

interface EditContaBancariaDialogProps {
  conta: ContaBancaria;
}

export function EditContaBancariaDialog({ conta }: EditContaBancariaDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutateAsync: updateConta } = useUpdateContaBancaria();

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);
      await updateConta({ id: conta.id, ...values });
      setOpen(false);
    } catch (error) {
      console.error("Error updating conta bancaria:", error);
    } finally {
      setIsSubmitting(false);
    }
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Conta Bancária</DialogTitle>
        </DialogHeader>
        <ContaBancariaForm 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
          defaultValues={{
            banco: conta.banco,
            agencia: conta.agencia,
            conta: conta.conta,
            titular: conta.titular || "",
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
