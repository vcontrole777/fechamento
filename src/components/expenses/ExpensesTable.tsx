
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
import { type Expense } from "@/hooks/useExpenses";

interface ExpensesTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  formatCurrency: (value: number) => string;
}

export default function ExpensesTable({
  expenses,
  onEdit,
  onDelete,
  formatCurrency,
}: ExpensesTableProps) {
  // Helper function to format the date consistently
  const formatDate = (dateString: string) => {
    console.log("Formatting expense date:", dateString, typeof dateString);
    
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
        console.log("Parsed expense date:", date.toISOString());
        return format(date, "dd/MM/yyyy", { locale: ptBR });
      }
      
      // Fallback
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Error formatting expense date:", error, dateString);
      return String(dateString); // Return the original string if formatting fails
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Responsável</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell>
                {formatDate(expense.data)}
              </TableCell>
              <TableCell>{expense.descricao}</TableCell>
              <TableCell>
                {expense.responsavel?.nome || "Não atribuído"}
              </TableCell>
              <TableCell>{formatCurrency(Number(expense.valor))}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(expense)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(expense)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
