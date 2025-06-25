
import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Recebimento, useDeleteRecebimento } from "@/hooks/useRecebimentos";
import { MoreHorizontal } from "lucide-react";

interface GroupedRecebimentoActionsProps {
  recebimentos: Recebimento[];
  formatCurrency: (value: number) => string;
}

export function GroupedRecebimentoActions({ recebimentos, formatCurrency }: GroupedRecebimentoActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { mutateAsync: deleteRecebimento, isPending } = useDeleteRecebimento();

  const totalValue = recebimentos.reduce((total, rec) => total + Number(rec.valor), 0);

  const handleDeleteAll = async () => {
    try {
      for (const recebimento of recebimentos) {
        await deleteRecebimento(recebimento.id);
      }
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting recebimentos:", error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Todos ({recebimentos.length})
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão em massa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir todos os {recebimentos.length} recebimentos 
              do tripeiro <span className="font-semibold">{recebimentos[0]?.tripeiro?.nome}</span> 
              no valor total de{" "}
              <span className="font-semibold">{formatCurrency(totalValue)}</span>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? "Excluindo..." : "Excluir Todos"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
