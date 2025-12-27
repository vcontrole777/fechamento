import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Trash2, AlertTriangle } from "lucide-react";
import { useClearAllData } from "@/hooks/useClearAllData";

export function ClearAllDataSection() {
  const { clearAllData, loading } = useClearAllData();
  const [confirmText, setConfirmText] = useState("");
  const [open, setOpen] = useState(false);

  const handleConfirm = async () => {
    const result = await clearAllData();
    if (result.success) {
      setOpen(false);
      setConfirmText("");
    }
  };

  const isConfirmValid = confirmText === "APAGAR TUDO";

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Zona de Perigo
        </CardTitle>
        <CardDescription>
          Ações irreversíveis que afetam todo o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <h4 className="font-medium text-destructive mb-2">
              Limpar Todos os Dados do Sistema
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Esta ação irá remover permanentemente TODOS os dados de TODAS as equipes:
              pagamentos, despesas, pessoas, notas e lembretes. As equipes e usuários
              serão mantidos, mas todos os dados operacionais serão apagados.
            </p>
            
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Todos os Dados
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Limpar TODOS os Dados do Sistema
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p className="font-medium text-foreground">
                      Esta é uma ação IRREVERSÍVEL que irá apagar:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Todos os pagamentos de todas as equipes</li>
                      <li>Todos os pagamentos de atendentes</li>
                      <li>Todos os pagamentos de tripeiros</li>
                      <li>Todas as despesas</li>
                      <li>Todas as pessoas (atendentes, tripeiros, responsáveis)</li>
                      <li>Todas as notas e lembretes</li>
                    </ul>
                    <p className="font-bold text-destructive">
                      ATENÇÃO: Esta ação NÃO pode ser desfeita!
                    </p>
                    <div className="mt-4">
                      <Label htmlFor="confirm-text" className="text-sm font-medium">
                        Para confirmar, digite <strong>APAGAR TUDO</strong> no campo abaixo:
                      </Label>
                      <Input
                        id="confirm-text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="APAGAR TUDO"
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
                    {loading ? "Apagando..." : "Confirmar Exclusão"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
