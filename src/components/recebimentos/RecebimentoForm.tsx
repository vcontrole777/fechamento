
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTripeiros } from "@/hooks/useTripeiros";
import { useContasBancarias } from "@/hooks/useContasBancarias";
import { useState } from "react";
import { NovaContaBancariaDialog } from "./NovaContaBancariaDialog";

const recebimentoSchema = z.object({
  data: z.date({ required_error: "Data é obrigatória" }),
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  id_tripeiro: z.string().min(1, "Tripeiro é obrigatório"),
  id_conta_bancaria: z.string().optional(),
  tipo_deposito: z.string().optional(),
  numero_comprovante: z.string().optional(),
  observacoes: z.string().optional(),
});

type RecebimentoFormValues = z.infer<typeof recebimentoSchema>;

interface RecebimentoFormProps {
  onSubmit: (values: RecebimentoFormValues & { conta_info?: any }) => void;
  isSubmitting?: boolean;
}

export function RecebimentoForm({ onSubmit, isSubmitting = false }: RecebimentoFormProps) {
  const [showNovaContaDialog, setShowNovaContaDialog] = useState(false);
  const { data: tripeiros = [] } = useTripeiros();
  const { data: contasBancarias = [] } = useContasBancarias();

  const form = useForm<RecebimentoFormValues>({
    resolver: zodResolver(recebimentoSchema),
    defaultValues: {
      data: new Date(),
      valor: 0,
      tipo_deposito: "deposito",
    },
  });

  const handleSubmit = (values: RecebimentoFormValues) => {
    const contaSelecionada = contasBancarias.find(
      conta => conta.id.toString() === values.id_conta_bancaria
    );

    onSubmit({
      ...values,
      conta_info: contaSelecionada,
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
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
                          format(field.value, "dd/MM/yyyy", { locale: ptBR })
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
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
            name="valor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="id_tripeiro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tripeiro</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tripeiro" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tripeiros.map((tripeiro) => (
                      <SelectItem key={tripeiro.id} value={tripeiro.id.toString()}>
                        {tripeiro.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="id_conta_bancaria"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conta Bancária</FormLabel>
                <div className="flex gap-2">
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione uma conta" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contasBancarias.map((conta) => (
                        <SelectItem key={conta.id} value={conta.id.toString()}>
                          {conta.nome} - {conta.banco}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowNovaContaDialog(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipo_deposito"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Depósito</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="deposito">Depósito</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="ted">TED</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="numero_comprovante"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Comprovante</FormLabel>
                <FormControl>
                  <Input placeholder="Número do comprovante (opcional)" {...field} />
                </FormControl>
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
                    placeholder="Observações adicionais (opcional)"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Recebimento"}
            </Button>
          </div>
        </form>
      </Form>

      <NovaContaBancariaDialog
        open={showNovaContaDialog}
        onOpenChange={setShowNovaContaDialog}
      />
    </>
  );
}
