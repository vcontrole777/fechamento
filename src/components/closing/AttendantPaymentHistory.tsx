import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import { WorkerPayment as AttendantPayment } from "@/types/workerPayment.types";
import { AttendantPaymentStatusBadge } from "./AttendantPaymentStatusBadge";
import { Trash2 } from "lucide-react";
import { formatLocalDate } from "@/utils/date";
import { useState } from "react";

interface AttendantPaymentHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendantName: string;
  payments: AttendantPayment[];
  formatCurrency: (value: number) => string;
  onDeletePayment: (paymentId: string) => void;
}

export function AttendantPaymentHistory({
  open,
  onOpenChange,
  attendantName,
  payments,
  formatCurrency,
  onDeletePayment,
}: AttendantPaymentHistoryProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);

  const handleDeleteClick = (paymentId: string) => {
    setPaymentToDelete(paymentId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (paymentToDelete) {
      onDeletePayment(paymentToDelete);
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      pix: 'PIX',
      deposito: 'Depósito',
      transferencia: 'Transferência',
      dinheiro: 'Dinheiro',
      outro: 'Outro',
    };
    return labels[method] || method;
  };

  const totalPaid = payments.reduce((sum, p) => sum + Number(p.valor_pago), 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Histórico de Pagamentos</DialogTitle>
            <DialogDescription>
              Histórico de pagamentos de comissões para {attendantName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum pagamento registrado para este atendente.
              </div>
            ) : (
              <>
                <div className="text-sm font-medium">
                  Total Pago: <span className="text-green-600 dark:text-green-400">{formatCurrency(totalPaid)}</span>
                </div>
                
                <div className="border rounded-md overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {formatLocalDate(payment.data_pagamento)}
                          </TableCell>
                          <TableCell className="text-xs">
                            {formatLocalDate(payment.periodo_inicio, 'dd/MM/yy')} - {formatLocalDate(payment.periodo_fim, 'dd/MM/yy')}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(Number(payment.valor_pago))}
                          </TableCell>
                          <TableCell>
                            {getMethodLabel(payment.metodo_pagamento)}
                          </TableCell>
                          <TableCell>
                            <AttendantPaymentStatusBadge 
                              status={payment.status}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(payment.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {payments.some(p => p.observacoes) && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Observações:</div>
                    {payments.filter(p => p.observacoes).map(payment => (
                      <div key={payment.id} className="text-xs p-2 bg-muted rounded">
                        <div className="font-medium">
                          {formatLocalDate(payment.data_pagamento)}
                        </div>
                        <div className="text-muted-foreground">{payment.observacoes}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
