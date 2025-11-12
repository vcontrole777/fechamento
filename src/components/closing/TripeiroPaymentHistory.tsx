import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTripeiroPaymentsQuery } from "@/hooks/tripeiroPayments/useTripeiroPaymentsQuery";
import { useDeleteTripeiroPayment } from "@/hooks/tripeiroPayments/useDeleteTripeiroPayment";
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

const parseLocalDate = (value: string | Date) => {
  if (value instanceof Date) return value;
  // If it's a date-only string (YYYY-MM-DD), parse in local time to avoid UTC shift
  if (typeof value === 'string' && value.length === 10 && value.includes('-') && !value.includes('T')) {
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y || 0, (m || 1) - 1, d || 1, 12, 0, 0, 0);
  }
  return new Date(value);
};

interface TripeiroPaymentHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripeiro: {
    id: number;
    nome: string;
    periodoInicio: string;
    periodoFim: string;
  } | null;
  formatCurrency: (value: number) => string;
}

export function TripeiroPaymentHistory({
  open,
  onOpenChange,
  tripeiro,
  formatCurrency,
}: TripeiroPaymentHistoryProps) {
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const { data: payments = [], isLoading } = useTripeiroPaymentsQuery(
    tripeiro?.id || 0,
    tripeiro?.periodoInicio || "",
    tripeiro?.periodoFim || ""
  );
  const { mutateAsync: deletePayment, isPending: isDeleting } = useDeleteTripeiroPayment();

  const handleDelete = async () => {
    if (!paymentToDelete) return;
    
    await deletePayment(paymentToDelete);
    setPaymentToDelete(null);
  };

  const getMetodoLabel = (metodo: string) => {
    const labels: Record<string, string> = {
      dinheiro: "Dinheiro",
      pix: "PIX",
      transferencia: "Transferência",
      outros: "Outros",
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

            {isLoading ? (
              <div className="text-center py-8">Carregando histórico...</div>
            ) : payments.length === 0 ? (
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
                          {format(parseLocalDate(payment.data_pagamento), "dd/MM/yyyy", { locale: ptBR })}
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
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
