import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

interface ClearDataDialogProps {
  onConfirm: () => void;
  loading: boolean;
  teamName: string;
}

export function ClearDataDialog({ onConfirm, loading, teamName }: ClearDataDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
    setConfirmText("");
  };

  const isConfirmValid = confirmText.toLowerCase() === "limpar dados";

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full md:w-auto">
          <Trash2 className="h-4 w-4 mr-2" />
          Limpar Todos os Dados
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive">
            Limpar Todos os Dados da Equipe
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p className="font-medium">
              Esta ação irá remover permanentemente TODOS os dados da equipe "{teamName}":
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Todos os pagamentos</li>
              <li>Todos os recebimentos</li>
              <li>Todas as despesas</li>
              <li>Todas as contas bancárias</li>
              <li>Todas as pessoas (atendentes e tripeiros)</li>
            </ul>
            <p className="font-medium text-destructive">
              Esta ação não pode ser desfeita!
            </p>
            <div className="mt-4">
              <Label htmlFor="confirm-text" className="text-sm font-medium">
                Para confirmar, digite "limpar dados" no campo abaixo:
              </Label>
              <Input
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="limpar dados"
                className="mt-2"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmText("")}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmValid || loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Limpando..." : "Confirmar Limpeza"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}