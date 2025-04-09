
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TripeiroWithPayments } from "./types";
import { formatCurrency } from "./utils";

interface SummaryTabProps {
  tripeiroSummaries: TripeiroWithPayments[];
  isLoading: boolean;
  onRegisterReceipt: (tripeiro: TripeiroWithPayments) => void;
}

export function SummaryTab({ tripeiroSummaries, isLoading, onRegisterReceipt }: SummaryTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo por Tripeiro</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full h-32 flex items-center justify-center">
            <div className="animate-pulse">Carregando...</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tripeiro</TableHead>
                <TableHead>Total em Pagamentos</TableHead>
                <TableHead>Total a Receber</TableHead>
                <TableHead>Já Recebido</TableHead>
                <TableHead>Pendente</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tripeiroSummaries.length > 0 ? (
                tripeiroSummaries.map((tripeiro) => (
                  <TableRow key={tripeiro.id}>
                    <TableCell className="font-medium">{tripeiro.nome}</TableCell>
                    <TableCell>{formatCurrency(tripeiro.totalPayments)}</TableCell>
                    <TableCell>{formatCurrency(tripeiro.totalReceivable)}</TableCell>
                    <TableCell>{formatCurrency(tripeiro.totalReceived)}</TableCell>
                    <TableCell>{formatCurrency(tripeiro.totalReceivable - tripeiro.totalReceived)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onRegisterReceipt(tripeiro)}
                      >
                        Registrar Recebimento
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Nenhum pagamento encontrado para o período selecionado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
