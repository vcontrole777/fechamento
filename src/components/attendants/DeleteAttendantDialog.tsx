
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

interface Attendant {
  id: number;
  nome: string;
}

interface DeleteAttendantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendant: Attendant | null;
  onConfirm: () => void;
}

export default function DeleteAttendantDialog({
  open,
  onOpenChange,
  attendant,
  onConfirm,
}: DeleteAttendantDialogProps) {
  if (!attendant) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover Atendente</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover o atendente "{attendant.nome}"? 
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
