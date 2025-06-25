
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteContaBancaria } from "./hooks/useDeleteContaBancaria";
import { ContaBancaria } from "@/types/conta-bancaria.types";

interface DeleteContaBancariaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conta: ContaBancaria;
}

export function DeleteContaBancariaDialog({
  open,
  onOpenChange,
  conta
}: DeleteContaBancariaDialogProps) {
  const { mutate: deleteConta, isPending } = useDeleteContaBancaria();

  const handleDelete = () => {
    deleteConta(conta.id, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Conta Bancária</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a conta "{conta.nome}" do banco {conta.banco}?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
