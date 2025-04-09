
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSharedDateFilter } from "@/hooks/useSharedDateFilter";
import { DateFilter } from "@/components/common/DateFilter";
import { Button } from "@/components/ui/button";
import { Calendar, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { toast } from "@/hooks/use-toast";
import { useTripeiros } from "@/hooks/useTripeiros";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

type ReceiptFormValues = {
  amount: string;
  receiptDate: Date;
};

// Define the structure for tripeiro receipt records since it's not in the types yet
type TripeiroRecebimento = {
  id: number;
  id_tripeiro: number;
  valor: number;
  data_recebimento: string;
  criado_em: string;
};

export default function Receivables() {
  const { dateRange, updateSharedDateFilter } = useSharedDateFilter();
  const [currentTab, setCurrentTab] = useState<"summary" | "details">("summary");
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [selectedTripeiro, setSelectedTripeiro] = useState<any>(null);
  const { tripeiros } = useTripeiros();

  // Format dates for database query
  const fromDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
  const toDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;

  // Fetch tripeiros and their payment data
  const { data: tripeiroSummaries = [], isLoading, refetch } = useQuery({
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
          
          // Fetch receipt records for this tripeiro using the raw query approach
          const { data: receipts, error: receiptsError } = await supabase
            .from('tripeiro_recebimentos')
            .select('*')
            .eq('id_tripeiro', tripeiro.id);
            
          if (receiptsError) {
            console.error("Error fetching receipts:", receiptsError);
            throw receiptsError;
          }
          
          // Cast receipts to the correct type
          const typedReceipts = receipts as unknown as TripeiroRecebimento[];
          
          // Calculate total received amount from receipt records
          const totalReceived = typedReceipts ? typedReceipts.reduce((sum, receipt) => sum + Number(receipt.valor), 0) : 0;
          
          return {
            ...tripeiro,
            payments: payments.sort((a, b) => 
              new Date(b.data).getTime() - new Date(a.data).getTime()
            ),
            receipts: typedReceipts || [],
            totalPayments,
            totalReceivable,
            completedAmount,
            receivedAmount,
            totalReceived
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

  const handleOpenReceiptDialog = (tripeiro) => {
    setSelectedTripeiro(tripeiro);
    setIsReceiptDialogOpen(true);
  };

  const form = useForm<ReceiptFormValues>({
    defaultValues: {
      amount: "",
      receiptDate: new Date(),
    },
  });

  const onSubmit = async (data: ReceiptFormValues) => {
    try {
      // Insert receipt record using raw query since the table is not in the types
      const { error } = await supabase
        .from('tripeiro_recebimentos')
        .insert({
          id_tripeiro: selectedTripeiro.id,
          valor: parseFloat(data.amount),
          data_recebimento: format(data.receiptDate, "yyyy-MM-dd"),
        });

      if (error) throw error;

      toast({
        title: "Recebimento registrado",
        description: `Recebimento de ${formatCurrency(parseFloat(data.amount))} para ${selectedTripeiro.nome} registrado com sucesso.`,
      });

      setIsReceiptDialogOpen(false);
      form.reset();
      refetch();
    } catch (error) {
      console.error("Erro ao registrar recebimento:", error);
      toast({
        title: "Erro ao registrar recebimento",
        description: "Ocorreu um erro ao tentar registrar o recebimento.",
        variant: "destructive",
      });
    }
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
                              onClick={() => handleOpenReceiptDialog(tripeiro)}
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
                          <div className="flex items-center gap-4">
                            <div className="text-sm">
                              Total a receber: <span className="font-bold">{formatCurrency(tripeiro.totalReceivable)}</span> 
                              {" | "}
                              Já recebido: <span className="font-bold">{formatCurrency(tripeiro.totalReceived)}</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleOpenReceiptDialog(tripeiro)}
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
        </TabsContent>
      </Tabs>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Recebimento</DialogTitle>
          </DialogHeader>
          {selectedTripeiro && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="text-sm mb-4">
                  Registrar recebimento para: <span className="font-medium">{selectedTripeiro.nome}</span>
                </div>
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Recebido</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="receiptDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data do Recebimento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsReceiptDialogOpen(false)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <Check className="mr-2 h-4 w-4" />
                    Registrar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
