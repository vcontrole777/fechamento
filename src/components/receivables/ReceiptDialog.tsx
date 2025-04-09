
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Check, X, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

import { ReceiptFormValues, TripeiroWithPayments } from "./types";
import { formatCurrency } from "./utils";

interface ReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tripeiro: TripeiroWithPayments | null;
  onSuccess: () => void;
}

export function ReceiptDialog({ isOpen, onClose, tripeiro, onSuccess }: ReceiptDialogProps) {
  const form = useForm<ReceiptFormValues>({
    defaultValues: {
      amount: "",
      receiptDate: new Date(),
    },
  });

  const onSubmit = async (data: ReceiptFormValues) => {
    try {
      if (!tripeiro) return;
      
      // Insert receipt record
      const { error } = await supabase
        .from('tripeiro_recebimentos')
        .insert({
          id_tripeiro: tripeiro.id,
          valor: parseFloat(data.amount),
          data_recebimento: format(data.receiptDate, "yyyy-MM-dd"),
        });

      if (error) throw error;

      toast({
        title: "Recebimento registrado",
        description: `Recebimento de ${formatCurrency(parseFloat(data.amount))} para ${tripeiro.nome} registrado com sucesso.`,
      });

      onClose();
      form.reset();
      onSuccess();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Recebimento</DialogTitle>
        </DialogHeader>
        {tripeiro && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="text-sm mb-4">
                Registrar recebimento para: <span className="font-medium">{tripeiro.nome}</span>
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
                  onClick={onClose}
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
  );
}
