
import React from "react";
import { format } from "date-fns";
import { Edit, Trash2 } from "lucide-react";
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
}

export default function ExpensesTable({
  expenses,
  onEdit,
  onDelete,
}: ExpensesTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead className="text-right">Valor</TableHead>
          <TableHead className="w-[100px]">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id}>
            <TableCell>
              {format(new Date(expense.data), "dd/MM/yyyy")}
            </TableCell>
            <TableCell>{expense.descricao}</TableCell>
            <TableCell>
              {expense.responsavel?.nome || "Não informado"}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(expense.valor)}
            </TableCell>
            <TableCell className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(expense)}
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(expense)}
                title="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
