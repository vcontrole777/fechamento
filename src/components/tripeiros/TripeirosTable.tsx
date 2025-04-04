
import { useState } from "react";
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
import { Tripeiro } from "@/hooks/useTripeiros";

interface TripeirosTableProps {
  tripeiros: Tripeiro[];
  onEditClick: (tripeiro: Tripeiro) => void;
  onDeleteClick: (tripeiro: Tripeiro) => void;
}

export default function TripeirosTable({ 
  tripeiros,
  onEditClick,
  onDeleteClick 
}: TripeirosTableProps) {
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
        {tripeiros.map((tripeiro) => (
          <TableRow key={tripeiro.id}>
            <TableCell className="font-medium">{tripeiro.nome}</TableCell>
            <TableCell>{tripeiro.porcentagem || 0}%</TableCell>
            <TableCell>
              {new Date(tripeiro.criado_em).toLocaleDateString("pt-BR")}
            </TableCell>
            <TableCell className="text-right space-x-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditClick(tripeiro)}
                title="Editar"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteClick(tripeiro)}
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
