import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PersonAvatar } from "@/components/common/PersonAvatar";
import { Attendant } from "@/hooks/useAttendants";

type SortField = 'nome' | 'porcentagem' | 'criado_em';
type SortOrder = 'asc' | 'desc';

interface AttendantsTableProps {
  attendants: Attendant[];
  onEditClick: (attendant: Attendant) => void;
  onDeleteClick: (attendant: Attendant) => void;
}

export default function AttendantsTable({ 
  attendants,
  onEditClick,
  onDeleteClick 
}: AttendantsTableProps) {
  const [sortField, setSortField] = useState<SortField>('nome');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedAttendants = [...attendants].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortField === 'criado_em') {
      return sortOrder === 'asc' 
        ? new Date(aValue).getTime() - new Date(bValue).getTime()
        : new Date(bValue).getTime() - new Date(aValue).getTime();
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortOrder === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <SortButton field="nome">Nome</SortButton>
          </TableHead>
          <TableHead>
            <SortButton field="porcentagem">Comissão</SortButton>
          </TableHead>
          <TableHead>
            <SortButton field="criado_em">Cadastro</SortButton>
          </TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedAttendants.map((attendant) => (
          <TableRow key={attendant.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <PersonAvatar name={attendant.nome} />
                <span className="font-medium">{attendant.nome}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="font-medium">
                {attendant.porcentagem || 0}%
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(attendant.criado_em).toLocaleDateString("pt-BR")}
            </TableCell>
            <TableCell className="text-right space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditClick(attendant)}
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteClick(attendant)}
                title="Excluir"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
