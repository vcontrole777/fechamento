
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Payment } from "@/hooks/usePayments";
import { Badge } from "@/components/ui/badge";

interface PaymentsTableProps {
  payments: Payment[];
  onEditClick: (payment: Payment) => void;
  onDeleteClick: (payment: Payment) => void;
}

export default function PaymentsTable({
  payments,
  onEditClick,
  onDeleteClick,
}: PaymentsTableProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "concluido":
        return "bg-green-500";
      case "pendente":
        return "bg-yellow-500";
      case "bloqueado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "concluido":
        return "Concluído";
      case "pendente":
        return "Pendente";
      case "bloqueado":
        return "Bloqueado";
      default:
        return status;
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Valor Total</TableHead>
            <TableHead>Atendente</TableHead>
            <TableHead>Tripeiro</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Nenhum pagamento encontrado.
              </TableCell>
            </TableRow>
          ) : (
            payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {format(new Date(payment.data), "dd/MM/yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>R$ {Number(payment.valor).toFixed(2)}</TableCell>
                <TableCell>
                  {payment.atendente?.nome || "N/A"}
                </TableCell>
                <TableCell>
                  {payment.tripeiro?.nome || "N/A"}
                </TableCell>
                <TableCell className="capitalize">
                  {payment.tipo === "pix" ? "PIX" : payment.tipo}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(payment.status)}>
                    {formatStatus(payment.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditClick(payment)}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteClick(payment)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
