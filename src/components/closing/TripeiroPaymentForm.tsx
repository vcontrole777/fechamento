import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { tripeiroPaymentSchema, TripeiroPaymentFormData } from "./schemas/tripeiroPaymentSchema";
import { CurrencyInput } from "@/components/ui/currency-input";

interface TripeiroPaymentFormProps {
  onSubmit: (data: TripeiroPaymentFormData) => void;
  defaultValues?: Partial<TripeiroPaymentFormData>;
  isSubmitting?: boolean;
}

export function TripeiroPaymentForm({
  onSubmit,
  defaultValues,
  isSubmitting = false,
}: TripeiroPaymentFormProps) {
  const form = useForm<TripeiroPaymentFormData>({
    resolver: zodResolver(tripeiroPaymentSchema),
    defaultValues: {
      valor_pago: defaultValues?.valor_pago || 0,
      data_pagamento: defaultValues?.data_pagamento || new Date().toISOString().split('T')[0],
      metodo_pagamento: defaultValues?.metodo_pagamento || "pix",
      observacoes: defaultValues?.observacoes || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="valor_pago"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Pago *</FormLabel>
              <FormControl>
                <CurrencyInput
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  placeholder="R$ 0,00"
                />
              </FormControl>
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
              <Popover>
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
                        format(new Date(field.value), "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(format(date, "yyyy-MM-dd"));
                      }
                    }}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(23, 59, 59, 999);
                      return date > today;
                    }}
                    locale={ptBR}
                    initialFocus
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
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
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
                  placeholder="Observações adicionais..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
