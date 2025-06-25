
import { useState } from "react";
import { Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useDeleteRecebimento } from "@/hooks/useRecebimentos";
import { Recebimento } from "@/hooks/useRecebimentos";

interface DeleteRecebimentoDialogProps {
  recebimento: Recebimento;
}

export function DeleteRecebimentoDialog({ recebimento }: DeleteRecebimentoDialogProps) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: deleteRecebimento, isPending } = useDeleteRecebimento();

  const handleDelete = async () => {
    try {
      await deleteRecebimento(recebimento.id);
      setOpen(false);
    } catch (error) {
      console.error("Error deleting recebimento:", error);
    }
  };

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
            Tem certeza que deseja excluir este recebimento de{" "}
            <span className="font-semibold">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(Number(recebimento.valor))}
            </span>{" "}
            do tripeiro{" "}
            <span className="font-semibold">{recebimento.tripeiro?.nome}</span>?
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
