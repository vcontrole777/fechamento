
import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Attendant } from "@/hooks/useAttendants";

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
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Comissão</TableHead>
          <TableHead>Data de Cadastro</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attendants.map((attendant) => (
          <TableRow key={attendant.id}>
            <TableCell className="font-medium">{attendant.nome}</TableCell>
            <TableCell>{attendant.porcentagem || 0}%</TableCell>
            <TableCell>
              {new Date(attendant.criado_em).toLocaleDateString("pt-BR")}
            </TableCell>
            <TableCell className="text-right space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditClick(attendant)}
                title="Editar"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
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
