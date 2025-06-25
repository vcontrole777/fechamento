
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
import { useDeleteRecebimento } from "./hooks/useDeleteRecebimento";
import { Recebimento } from "@/types/recebimento.types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DeleteRecebimentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recebimento: Recebimento;
}

export function DeleteRecebimentoDialog({
  open,
  onOpenChange,
  recebimento
}: DeleteRecebimentoDialogProps) {
  const { mutate: deleteRecebimento, isPending } = useDeleteRecebimento();

  const handleDelete = () => {
    deleteRecebimento(recebimento.id, {
      onSuccess: () => {
        onOpenChange(false);
      }
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Recebimento</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir este recebimento?
            <br /><br />
            <strong>Tripeiro:</strong> {recebimento.tripeiro?.nome}
            <br />
            <strong>Data:</strong> {format(new Date(recebimento.data), "dd/MM/yyyy", { locale: ptBR })}
            <br />
            <strong>Valor:</strong> {formatCurrency(Number(recebimento.valor))}
            <br /><br />
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
