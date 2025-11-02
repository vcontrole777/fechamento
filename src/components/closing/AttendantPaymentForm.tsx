import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input";
import { attendantPaymentSchema, AttendantPaymentFormData } from "./schemas/attendantPaymentSchema";

interface AttendantPaymentFormProps {
  onSubmit: (data: AttendantPaymentFormData) => void;
  onCancel: () => void;
  defaultValues?: Partial<AttendantPaymentFormData>;
  totalCommission: number;
  totalPaid: number;
  formatCurrency: (value: number) => string;
  attendantName: string;
  isSubmitting?: boolean;
}

export function AttendantPaymentForm({
  onSubmit,
  onCancel,
  defaultValues,
  totalCommission,
  totalPaid,
  formatCurrency,
  attendantName,
  isSubmitting = false,
}: AttendantPaymentFormProps) {
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const remainingAmount = totalCommission - totalPaid;

  const form = useForm<AttendantPaymentFormData>({
    resolver: zodResolver(attendantPaymentSchema),
    defaultValues: {
      valor_pago: defaultValues?.valor_pago || 0,
      data_pagamento: defaultValues?.data_pagamento || new Date(),
      metodo_pagamento: defaultValues?.metodo_pagamento || 'pix',
      observacoes: defaultValues?.observacoes || '',
    },
  });

  const valorPago = form.watch('valor_pago');
  const newRemaining = remainingAmount - (valorPago || 0);

  const handleFormSubmit = (data: AttendantPaymentFormData) => {
    console.log('=== AttendantPaymentForm - handleFormSubmit ===');
    console.log('Dados do formulário:', data);
    console.log('Valor pago:', data.valor_pago);
    console.log('Data pagamento:', data.data_pagamento);
    console.log('Método:', data.metodo_pagamento);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Atendente:</span> {attendantName}
          </div>
          <div className="text-sm">
            <span className="font-medium">Comissão Total:</span> {formatCurrency(totalCommission)}
          </div>
          <div className="text-sm">
            <span className="font-medium">Já Pago:</span> {formatCurrency(totalPaid)}
          </div>
          <div className="text-sm font-semibold">
            <span className="font-medium">Saldo Pendente:</span>{' '}
            <span className={remainingAmount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}>
              {formatCurrency(remainingAmount)}
            </span>
          </div>
        </div>

        <FormField
          control={form.control}
          name="valor_pago"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor a Pagar *</FormLabel>
              <FormControl>
                <CurrencyInput
                  placeholder="R$ 0,00"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                {newRemaining > 0 ? (
                  <span className="text-orange-600 dark:text-orange-400">
                    Faltará: {formatCurrency(Math.max(0, newRemaining))}
                  </span>
                ) : newRemaining < 0 ? (
                  <span className="text-red-600 dark:text-red-400">
                    Valor excede o saldo pendente em {formatCurrency(Math.abs(newRemaining))}
                  </span>
                ) : (
                  <span className="text-green-600 dark:text-green-400">
                    Pagamento completo!
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_pagamento"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Pagamento *</FormLabel>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd/MM/yyyy")
                      ) : (
                        <span>Selecione a data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date);
                      setIsCalendarOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="metodo_pagamento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Método de Pagamento *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacoes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre o pagamento (opcional)"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Pagamento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
