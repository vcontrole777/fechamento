
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ContaBancaria, useDeleteContaBancaria } from "@/hooks/useContasBancarias";

interface DeleteContaBancariaDialogProps {
  conta: ContaBancaria;
}

export function DeleteContaBancariaDialog({ conta }: DeleteContaBancariaDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: deleteConta, isPending } = useDeleteContaBancaria();

  const handleDelete = async () => {
    try {
      await deleteConta(conta.id);
      setOpen(false);
    } catch (error) {
      console.error("Error deleting conta bancaria:", error);
    }
  };

  const contaDisplayName = `${conta.banco} - ${conta.agencia}/${conta.conta}`;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a conta bancária "{contaDisplayName}"?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
