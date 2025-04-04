
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

interface Tripeiro {
  id: number;
  nome: string;
}

interface DeleteTrypeiroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripeiro: Tripeiro | null;
  onConfirm: () => void;
}

export default function DeleteTrypeiroDialog({
  open,
  onOpenChange,
  tripeiro,
  onConfirm,
}: DeleteTrypeiroDialogProps) {
  if (!tripeiro) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Tripeiro</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover o tripeiro "{tripeiro.nome}"? 
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Remover
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
