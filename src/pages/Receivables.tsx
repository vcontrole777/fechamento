
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSharedDateFilter } from "@/hooks/useSharedDateFilter";
import { DateFilter } from "@/components/common/DateFilter";

export default function Receivables() {
  const { dateRange, updateSharedDateFilter } = useSharedDateFilter();
  const [currentTab, setCurrentTab] = useState<"summary" | "details">("summary");

  // Format dates for database query
  const fromDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
  const toDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;

  // Fetch tripeiros and their payment data
  const { data: tripeiroSummaries = [], isLoading } = useQuery({
    queryKey: ["tripeiro-receivables", dateRange],
    queryFn: async () => {
      console.log("Fetching tripeiro receivables with date range:", { fromDate, toDate });
      
      // First, fetch all tripeiros
      const { data: tripeiros, error: tripeiroError } = await supabase
        .from("pessoas")
        .select("id, nome, porcentagem")
        .eq("tipo", "tripeiro")
        .order("nome");
      
      if (tripeiroError) throw tripeiroError;
      
      // For each tripeiro, fetch their payment data with the date filter
      const tripeirosWithPayments = await Promise.all(
        tripeiros.map(async (tripeiro) => {
          let query = supabase
            .from("pagamentos")
            .select(`
              id, data, valor, porcentagem_tripeiro, status
            `)
            .eq("id_tripeiro", tripeiro.id);
          
          // Apply date filters if provided
          if (fromDate) query = query.gte('data', fromDate);
          if (toDate) query = query.lte('data', toDate);
          
          const { data: payments, error: paymentsError } = await query;
          
          if (paymentsError) throw paymentsError;
          
          // Calculate the total receivable amount for this tripeiro
          const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.valor), 0);
          const totalReceivable = payments.reduce((sum, payment) => {
            const amount = Number(payment.valor);
            const percentage = Number(payment.porcentagem_tripeiro);
            return sum + (amount * percentage / 100);
          }, 0);

          const completedPayments = payments.filter(payment => payment.status === "concluido");
          const completedAmount = completedPayments.reduce((sum, payment) => sum + Number(payment.valor), 0);
          const receivedAmount = completedPayments.reduce((sum, payment) => {
            const amount = Number(payment.valor);
            const percentage = Number(payment.porcentagem_tripeiro);
            return sum + (amount * percentage / 100);
          }, 0);
          
          return {
            ...tripeiro,
            payments: payments.sort((a, b) => 
              new Date(b.data).getTime() - new Date(a.data).getTime()
            ),
            totalPayments,
            totalReceivable,
            completedAmount,
            receivedAmount
          };
        })
      );
      
      return tripeirosWithPayments;
    }
  });

  const handleDateFilterChange = (newDateRange, option) => {
    updateSharedDateFilter(newDateRange, option);
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Recebimentos</h1>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <DateFilter onFilterChange={handleDateFilterChange} />
        </div>
      </div>

      <Tabs defaultValue="summary" value={currentTab} onValueChange={(value) => setCurrentTab(value as any)}>
        <TabsList>
          <TabsTrigger value="summary">Resumo</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-4">
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tripeiroSummaries.length > 0 ? (
                      tripeiroSummaries.map((tripeiro) => (
                        <TableRow key={tripeiro.id}>
                          <TableCell className="font-medium">{tripeiro.nome}</TableCell>
                          <TableCell>{formatCurrency(tripeiro.totalPayments)}</TableCell>
                          <TableCell>{formatCurrency(tripeiro.totalReceivable)}</TableCell>
                          <TableCell>{formatCurrency(tripeiro.receivedAmount)}</TableCell>
                          <TableCell>{formatCurrency(tripeiro.totalReceivable - tripeiro.receivedAmount)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">
                          Nenhum pagamento encontrado para o período selecionado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details" className="mt-4">
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
                  {tripeiroSummaries.length > 0 ? (
                    tripeiroSummaries.map((tripeiro) => (
                      <div key={tripeiro.id} className="space-y-3">
                        <div className="flex justify-between items-center border-b pb-2">
                          <h3 className="text-lg font-medium">{tripeiro.nome}</h3>
                          <div className="text-sm">
                            Total a receber: <span className="font-bold">{formatCurrency(tripeiro.totalReceivable)}</span> 
                            {" | "}
                            Já recebido: <span className="font-bold">{formatCurrency(tripeiro.receivedAmount)}</span>
                          </div>
                        </div>
                        
                        {tripeiro.payments.length > 0 ? (
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
                        ) : (
                          <div className="text-center py-4 text-sm text-gray-500">
                            Nenhum pagamento encontrado para este tripeiro no período selecionado.
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
