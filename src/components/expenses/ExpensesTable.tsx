
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Pencil, Trash2, ArrowUpDown } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import { ExpenseCategoryBadge } from "./ExpenseCategoryBadge";

type SortField = 'data' | 'valor' | 'descricao';
type SortOrder = 'asc' | 'desc';

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
  const isMobile = useIsMobile();
  const [sortField, setSortField] = useState<SortField>('data');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === 'data') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else if (sortField === 'valor') {
      aValue = Number(aValue);
      bValue = Number(bValue);
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
  });
  
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

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      onClick={() => handleSort(field)}
      className="h-8 px-2 lg:px-3 font-medium hover:bg-muted"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton field="data">Data</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="descricao">Descrição</SortButton>
            </TableHead>
            {!isMobile && <TableHead>Categoria</TableHead>}
            {!isMobile && <TableHead>Responsável</TableHead>}
            <TableHead>
              <SortButton field="valor">Valor</SortButton>
            </TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedExpenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="whitespace-nowrap">
                {formatDate(expense.data)}
              </TableCell>
              <TableCell className={isMobile ? "max-w-[120px] truncate" : ""}>
                {expense.descricao}
              </TableCell>
              {!isMobile && (
                <TableCell>
                  <ExpenseCategoryBadge category={expense.categoria || null} />
                </TableCell>
              )}
              {!isMobile && (
                <TableCell>
                  {expense.responsavel?.nome || "Não atribuído"}
                </TableCell>
              )}
              <TableCell className="font-medium">{formatCurrency(Number(expense.valor))}</TableCell>
              <TableCell className="text-right whitespace-nowrap">
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
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
