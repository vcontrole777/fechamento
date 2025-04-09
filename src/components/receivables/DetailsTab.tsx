
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TripeiroWithPayments, TripeiroRecebimento } from "./types";
import { formatCurrency, isNonZeroValue } from "./utils";

interface DetailsTabProps {
  tripeiroSummaries: TripeiroWithPayments[];
  isLoading: boolean;
  onRegisterReceipt: (tripeiro: TripeiroWithPayments) => void;
}

export function DetailsTab({ tripeiroSummaries, isLoading, onRegisterReceipt }: DetailsTabProps) {
  // Filter tripeiros with non-zero payments or receivables
  const filteredTripeiros = tripeiroSummaries.filter(tripeiro => 
    isNonZeroValue(tripeiro.totalPayments) || 
    isNonZeroValue(tripeiro.totalReceivable) || 
    isNonZeroValue(tripeiro.totalReceived)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes de Pagamentos por Tripeiro</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="w-full h-32 flex items-center justify-center">
            <div className="animate-pulse">Carregando...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredTripeiros.length > 0 ? (
              filteredTripeiros.map((tripeiro) => (
                <div key={tripeiro.id} className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h3 className="text-lg font-medium">
                      {tripeiro.nome} {tripeiro.porcentagem && `(${tripeiro.porcentagem}%)`}
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        Total a receber: <span className="font-bold">
                          {isNonZeroValue(tripeiro.totalReceivable) ? formatCurrency(tripeiro.totalReceivable) : "-"}
                        </span> 
                        {" | "}
                        Já recebido: <span className="font-bold">
                          {isNonZeroValue(tripeiro.totalReceived) ? formatCurrency(tripeiro.totalReceived) : "-"}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onRegisterReceipt(tripeiro)}
                      >
                        Registrar Recebimento
                      </Button>
                    </div>
                  </div>
                  
                  {/* Payments details */}
                  {tripeiro.payments.length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Pagamentos</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead>Porcentagem</TableHead>
                            <TableHead>Valor a Receber</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tripeiro.payments.map((payment) => {
                            // Calculate the amount to receive: payment amount * percentage / 100
                            const receivable = Number(payment.valor) * (Number(payment.porcentagem_tripeiro) / 100);
                            
                            return (
                              <TableRow key={payment.id}>
                                <TableCell>{format(new Date(payment.data), 'dd/MM/yyyy')}</TableCell>
                                <TableCell>{formatCurrency(Number(payment.valor))}</TableCell>
                                <TableCell>{payment.porcentagem_tripeiro}%</TableCell>
                                <TableCell>{formatCurrency(receivable)}</TableCell>
                                <TableCell>
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      payment.status === "concluido"
                                        ? "bg-green-100 text-green-800"
                                        : payment.status === "pendente"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {payment.status === "concluido"
                                      ? "Concluído"
                                      : payment.status === "pendente"
                                      ? "Pendente"
                                      : "Bloqueado"}
                                  </span>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-sm text-gray-500">
                      Nenhum pagamento encontrado para este tripeiro no período selecionado.
                    </div>
                  )}
                  
                  {/* Receipts details */}
                  {tripeiro.receipts.length > 0 && (
                    <div className="space-y-4 mt-6">
                      <h4 className="text-sm font-medium">Recebimentos Registrados</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Valor Recebido</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tripeiro.receipts.map((receipt: TripeiroRecebimento) => (
                            <TableRow key={receipt.id}>
                              <TableCell>{format(new Date(receipt.data_recebimento), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>{formatCurrency(Number(receipt.valor))}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum pagamento encontrado para o período selecionado.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
