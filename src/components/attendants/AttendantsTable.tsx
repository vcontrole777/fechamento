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
import { Worker as Attendant } from "@/hooks/workers/useWorkers";
import { useState as useStateReact, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveTeamId } from "@/hooks/useEffectiveTeamId";

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
  const [indicadoresMap, setIndicadoresMap] = useState<Record<number, string>>({});
  const teamId = useEffectiveTeamId();

  // Fetch all indicadores names
  useEffect(() => {
    const fetchIndicadores = async () => {
      const indicadorIds = attendants
        .map(a => a.id_indicador)
        .filter((id): id is number => id !== null && id !== undefined);

      if (indicadorIds.length === 0 || !teamId) return;

      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome")
        .in("id", indicadorIds)
        .eq("id_equipe", teamId);

      if (error) {
        console.error("Erro ao carregar indicadores:", error);
        return;
      }

      const map: Record<number, string> = {};
      data?.forEach(p => {
        map[p.id] = p.nome;
      });
      setIndicadoresMap(map);
    };

    fetchIndicadores();
  }, [attendants, teamId]);

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
          <TableHead>Indicado por</TableHead>
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
              {attendant.id_indicador ? (
                <div className="flex flex-col gap-1">
                  <span>{indicadoresMap[attendant.id_indicador] || "..."}</span>
                  <Badge variant="outline" className="w-fit text-xs">
                    {attendant.porcentagem_indicacao || 0}%
                  </Badge>
                </div>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
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
