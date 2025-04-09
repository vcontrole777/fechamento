
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TripeiroWithPayments } from "./types";
import { formatCurrency, isNonZeroValue } from "./utils";

interface SummaryTabProps {
  tripeiroSummaries: TripeiroWithPayments[];
  isLoading: boolean;
  onRegisterReceipt: (tripeiro: TripeiroWithPayments) => void;
}

export function SummaryTab({ tripeiroSummaries, isLoading, onRegisterReceipt }: SummaryTabProps) {
  // Filter tripeiros with non-zero payments or receivables
  const filteredTripeiros = tripeiroSummaries.filter(tripeiro => 
    isNonZeroValue(tripeiro.totalPayments) || 
    isNonZeroValue(tripeiro.totalReceivable) || 
    isNonZeroValue(tripeiro.totalReceived)
  );

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
              {filteredTripeiros.length > 0 ? (
                filteredTripeiros.map((tripeiro) => (
                  <TableRow key={tripeiro.id}>
                    <TableCell className="font-medium">{tripeiro.nome}</TableCell>
                    <TableCell>{isNonZeroValue(tripeiro.totalPayments) ? formatCurrency(tripeiro.totalPayments) : "-"}</TableCell>
                    <TableCell>{isNonZeroValue(tripeiro.totalReceivable) ? formatCurrency(tripeiro.totalReceivable) : "-"}</TableCell>
                    <TableCell>{isNonZeroValue(tripeiro.totalReceived) ? formatCurrency(tripeiro.totalReceived) : "-"}</TableCell>
                    <TableCell>
                      {isNonZeroValue(tripeiro.totalReceivable - tripeiro.totalReceived) 
                        ? formatCurrency(tripeiro.totalReceivable - tripeiro.totalReceived) 
                        : "-"}
                    </TableCell>
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
