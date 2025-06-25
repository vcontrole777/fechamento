
import { useState } from "react";
import { Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Recebimento } from "@/hooks/useRecebimentos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ViewRecebimentoDetailsDialogProps {
  recebimentos: Recebimento[];
  formatCurrency: (value: number) => string;
}

export function ViewRecebimentoDetailsDialog({ recebimentos, formatCurrency }: ViewRecebimentoDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const formatTipoDeposito = (tipo: string | null) => {
    if (!tipo) return "-";
    
    const tipos: { [key: string]: string } = {
      deposito: "Depósito",
      transferencia: "Transferência",
      pix: "PIX",
      ted: "TED",
    };
    
    return tipos[tipo] || tipo;
  };

  const totalGeral = recebimentos.reduce((total, recebimento) => total + Number(recebimento.valor), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Detalhes dos Recebimentos - {recebimentos[0]?.tripeiro?.nome}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {formatDate(recebimentos[0]?.data)} • {recebimentos[0]?.banco} • {recebimentos[0]?.conta_depositada}
          </p>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total Geral:</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(totalGeral)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {recebimentos.length} recebimento{recebimentos.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Valor</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Comprovante</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recebimentos.map((recebimento) => (
                  <TableRow key={recebimento.id}>
                    <TableCell className="font-semibold">
                      {formatCurrency(Number(recebimento.valor))}
                    </TableCell>
                    <TableCell>
                      {formatTipoDeposito(recebimento.tipo_deposito)}
                    </TableCell>
                    <TableCell>
                      {recebimento.numero_comprovante || "-"}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      {recebimento.observacoes ? (
                        <div className="truncate" title={recebimento.observacoes}>
                          {recebimento.observacoes}
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(recebimento.criado_em), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
