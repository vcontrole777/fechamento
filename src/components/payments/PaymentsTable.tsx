
import { format, parseISO } from "date-fns";
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
import { Payment } from "@/types/payment.types";
import { Badge } from "@/components/ui/badge";

interface PaymentsTableProps {
  payments: Payment[];
  onEditClick: (payment: Payment) => void;
  onDeleteClick: (payment: Payment) => void;
  formatCurrency: (value: number) => string;
}

export default function PaymentsTable({
  payments,
  onEditClick,
  onDeleteClick,
  formatCurrency,
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

  const formatDate = (dateString: string) => {
    console.log("Formatting date string:", dateString, typeof dateString);
    
    try {
      // If it's already a date object, use it directly
      if (dateString instanceof Date) {
        return format(dateString, "dd/MM/yyyy", { locale: ptBR });
      }
      
      // Handle ISO date strings (with or without time components)
      if (dateString.includes('T') || dateString.includes(':')) {
        return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
      }
      
      // For YYYY-MM-DD format
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Manually parse the date to avoid timezone issues
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        console.log("Parsed date:", date.toISOString());
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      }
      
      // Fallback
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return dateString; // Return the original string if formatting fails
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
                  {formatDate(payment.data)}
                </TableCell>
                <TableCell>{formatCurrency(Number(payment.valor))}</TableCell>
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
