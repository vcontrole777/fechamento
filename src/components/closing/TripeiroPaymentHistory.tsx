import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { formatLocalDate } from "@/utils/date";
import { WorkerPayment } from "@/types/workerPayment.types";
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
import { useState } from "react";

interface TripeiroPaymentHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripeiro: {
    id: number;
    nome: string;
    periodoInicio: string;
    periodoFim: string;
  } | null;
  payments: WorkerPayment[];
  onDeletePayment: (paymentId: string) => void;
  formatCurrency: (value: number) => string;
}

export function TripeiroPaymentHistory({
  open,
  onOpenChange,
  tripeiro,
  payments,
  onDeletePayment,
  formatCurrency,
}: TripeiroPaymentHistoryProps) {
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  const handleDelete = () => {
    if (!paymentToDelete) return;

    onDeletePayment(paymentToDelete);
    setPaymentToDelete(null);
  };

  const getMetodoLabel = (metodo: string) => {
    const labels: Record<string, string> = {
      dinheiro: "Dinheiro",
      pix: "PIX",
      deposito: "Depósito",
      transferencia: "Transferência",
      outro: "Outro",
    };
    return labels[metodo] || metodo;
  };

  const totalPago = payments.reduce((sum, p) => sum + Number(p.valor_pago), 0);

  if (!tripeiro) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Pagamentos - {tripeiro.nome}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm font-medium">Total Pago: {formatCurrency(totalPago)}</div>
            </div>

            {payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum pagamento registrado ainda.
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Observações</TableHead>
                      <TableHead className="w-20">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {formatLocalDate(payment.data_pagamento)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(Number(payment.valor_pago))}
                        </TableCell>
                        <TableCell>{getMetodoLabel(payment.metodo_pagamento)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {payment.observacoes || "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => setPaymentToDelete(payment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!paymentToDelete} onOpenChange={(open) => !open && setPaymentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
