
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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

type SortField = "data" | "valor" | "atendente" | "tripeiro" | "status";
type SortOrder = "asc" | "desc";

export default function PaymentsTable({
  payments,
  onEditClick,
  onDeleteClick,
  formatCurrency,
}: PaymentsTableProps) {
  const [sortField, setSortField] = useState<SortField>("data");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedPayments = [...payments].sort((a, b) => {
    let compareValue = 0;
    
    switch (sortField) {
      case "data":
        compareValue = new Date(a.data).getTime() - new Date(b.data).getTime();
        break;
      case "valor":
        compareValue = Number(a.valor) - Number(b.valor);
        break;
      case "atendente":
        compareValue = (a.atendente?.nome || "").localeCompare(b.atendente?.nome || "");
        break;
      case "tripeiro":
        compareValue = (a.tripeiro?.nome || "").localeCompare(b.tripeiro?.nome || "");
        break;
      case "status":
        compareValue = a.status.localeCompare(b.status);
        break;
    }
    
    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  const totalValue = sortedPayments.reduce((sum, payment) => sum + Number(payment.valor), 0);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "concluido":
        return "bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600";
      case "pendente":
        return "bg-yellow-600 dark:bg-yellow-500 hover:bg-yellow-700 dark:hover:bg-yellow-600";
      case "bloqueado":
        return "bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600";
      default:
        return "bg-gray-600 dark:bg-gray-500";
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "concluido":
        return "Aprovado";
      case "pendente":
        return "Em análise";
      case "bloqueado":
        return "Bloqueado";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    console.log("Formatting date string:", dateString, typeof dateString);
    
    try {
      // Check if it's a Date object (using type checking instead of instanceof)
      if (Object.prototype.toString.call(dateString) === '[object Date]') {
        return format(dateString as unknown as Date, "dd/MM/yyyy", { locale: ptBR });
      }
      
      // Handle ISO date strings (with or without time components)
      if (typeof dateString === 'string' && (dateString.includes('T') || dateString.includes(':'))) {
        return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
      }
      
      // For YYYY-MM-DD format
      if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
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

  const formatPercentage = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return "-";
    return `${value}%`;
  };

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      type="button"
      className="-ml-3 h-8 flex items-center gap-2 px-3 hover:bg-accent/50 rounded-md transition-colors cursor-pointer"
      onClick={() => handleSort(field)}
    >
      <span>{children}</span>
      <ArrowUpDown className={`h-4 w-4 transition-transform ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`} />
    </button>
  );

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead
                onClick={() => handleSort("data")}
                aria-sort={sortField === "data" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                className="cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span>Data</span>
                  {sortField === "data" ? (
                    sortOrder === "asc" ? (
                      <ArrowUp className="h-4 w-4 text-primary" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-primary" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("valor")}
                aria-sort={sortField === "valor" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                className="cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span>Valor Total</span>
                  {sortField === "valor" ? (
                    sortOrder === "asc" ? (
                      <ArrowUp className="h-4 w-4 text-primary" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-primary" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </TableHead>
              <TableHead
                onClick={() => handleSort("atendente")}
                aria-sort={sortField === "atendente" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                className="cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span>Atendente</span>
                  {sortField === "atendente" ? (
                    sortOrder === "asc" ? (
                      <ArrowUp className="h-4 w-4 text-primary" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-primary" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </TableHead>
              <TableHead>% Atendente</TableHead>
              <TableHead
                onClick={() => handleSort("tripeiro")}
                aria-sort={sortField === "tripeiro" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                className="cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span>Tripeiro</span>
                  {sortField === "tripeiro" ? (
                    sortOrder === "asc" ? (
                      <ArrowUp className="h-4 w-4 text-primary" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-primary" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </TableHead>
              <TableHead>% Tripeiro</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead
                onClick={() => handleSort("status")}
                aria-sort={sortField === "status" ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                className="cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span>Status</span>
                  {sortField === "status" ? (
                    sortOrder === "asc" ? (
                      <ArrowUp className="h-4 w-4 text-primary" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-primary" />
                    )
                  ) : (
                    <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Nenhum pagamento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {sortedPayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                      {formatDate(payment.data)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(Number(payment.valor))}
                    </TableCell>
                    <TableCell>
                      {payment.atendente?.nome || <span className="text-muted-foreground">N/A</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {formatPercentage(payment.atendente?.porcentagem || payment.porcentagem_atendente)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.tripeiro?.nome || <span className="text-muted-foreground">N/A</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {formatPercentage(payment.tripeiro?.porcentagem || payment.porcentagem_tripeiro)}
                      </Badge>
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
                        className="hover:bg-primary/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteClick(payment)}
                        className="hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold hover:bg-muted/50">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-lg">{formatCurrency(totalValue)}</TableCell>
                  <TableCell colSpan={7}></TableCell>
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
