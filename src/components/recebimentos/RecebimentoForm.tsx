import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Minus } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTripeiros } from "@/hooks/useTripeiros";
import { useContasBancarias } from "@/hooks/useContasBancarias";
import { useResponsaveis } from "@/components/expenses/hooks/useResponsaveis";
import { useState, useEffect } from "react";
import { NovaContaBancariaDialog } from "./NovaContaBancariaDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { CurrencyFormField, CurrencyInput, formatBrazilianCurrency, formatInputValue, parseBrazilianCurrency } from "@/components/ui/currency-input";

const recebimentoSchema = z.object({
  data: z.date({ required_error: "Data é obrigatória" }),
  valor: z.number().min(0.01, "Valor deve ser maior que zero"),
  valores_massa: z.array(z.number().min(0.01, "Valor deve ser maior que zero")).optional(),
  adicionar_em_massa: z.boolean().default(false),
  id_tripeiro: z.string().min(1, "Tripeiro é obrigatório"),
  id_conta_bancaria: z.string().optional(),
  id_responsavel: z.string().optional(),
  tipo_deposito: z.string().optional(),
  observacoes: z.string().optional(),
});

type RecebimentoFormValues = z.infer<typeof recebimentoSchema>;

interface RecebimentoFormProps {
  onSubmit: (values: RecebimentoFormValues) => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<RecebimentoFormValues>;
}

export function RecebimentoForm({ onSubmit, isSubmitting = false, defaultValues }: RecebimentoFormProps) {
  const [showNovaContaDialog, setShowNovaContaDialog] = useState(false);
  const [valoresMassa, setValoresMassa] = useState<number[]>([]);
  const { tripeiros } = useTripeiros();
  const { data: contasBancarias = [] } = useContasBancarias();
  const { data: responsaveis = [] } = useResponsaveis();

  const form = useForm<RecebimentoFormValues>({
    resolver: zodResolver(recebimentoSchema),
    defaultValues: {
      data: new Date(),
      valor: 0,
      adicionar_em_massa: false,
      tipo_deposito: "deposito",
      ...defaultValues,
    },
  });

  // Update form values when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      Object.keys(defaultValues).forEach((key) => {
        const value = defaultValues[key as keyof typeof defaultValues];
        if (value !== undefined) {
          form.setValue(key as keyof RecebimentoFormValues, value);
        }
      });
    }
  }, [defaultValues, form]);

  const adicionarEmMassa = form.watch("adicionar_em_massa");
  const isEditMode = !!defaultValues;
  const tipoDeposito = form.watch("tipo_deposito");
  const isEspecieSelected = tipoDeposito === "especie";


  const adicionarValor = () => {
    setValoresMassa([...valoresMassa, 0]);
  };

  const removerValor = (index: number) => {
    const novosValores = valoresMassa.filter((_, i) => i !== index);
    setValoresMassa(novosValores);
  };

  const atualizarValor = (index: number, valor: number) => {
    const novosValores = [...valoresMassa];
    novosValores[index] = valor;
    setValoresMassa(novosValores);
  };

  const handleSubmit = (values: RecebimentoFormValues) => {
    // Se estiver em modo massa, incluir os valores adicionais
    const valoresParaSubmeter = adicionarEmMassa ? {
      ...values,
      valores_massa: valoresMassa.filter(v => v > 0),
    } : values;

    onSubmit(valoresParaSubmeter);
  };

  const calcularTotalMassa = () => {
    const valorPrincipal = form.getValues("valor") || 0;
    const somaValoresMassa = valoresMassa.reduce((sum, valor) => sum + (valor || 0), 0);
    return valorPrincipal + somaValoresMassa;
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

          {!isEditMode && (
            <FormField
              control={form.control}
              name="adicionar_em_massa"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Adicionar valores em massa
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Permite adicionar múltiplos valores de uma vez
                    </p>
                  </div>
                </FormItem>
              )}
            />
          )}

          <CurrencyFormField
            control={form.control}
            name="valor"
            label={adicionarEmMassa && !isEditMode ? "Primeiro Valor" : "Valor"}
          />

          {adicionarEmMassa && !isEditMode && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Valores Adicionais</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={adicionarValor}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Valor
                </Button>
              </div>
              
              {valoresMassa.map((valor, index) => (
                <div key={index} className="flex gap-2">
                  <CurrencyInput
                    value={valor}
                    onChange={(numericValue) => atualizarValor(index, numericValue)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removerValor(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {valoresMassa.length > 0 && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium">
                    Total Geral: R$ {formatBrazilianCurrency(calcularTotalMassa())}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {valoresMassa.filter(v => v > 0).length + 1} recebimentos serão criados
                  </p>
                </div>
              )}
            </div>
          )}

          <FormField
            control={form.control}
            name="id_tripeiro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tripeiro</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
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
            name="tipo_deposito"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Depósito</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="deposito">Depósito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="especie">Espécie</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {!isEspecieSelected && (
            <FormField
              control={form.control}
              name="id_conta_bancaria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conta Bancária</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Selecione uma conta" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contasBancarias.map((conta) => (
                          <SelectItem key={conta.id} value={conta.id.toString()}>
                            {conta.titular || "Titular não informado"} - {conta.banco}
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
          )}

          {isEspecieSelected && (
            <FormField
              control={form.control}
              name="id_responsavel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável pelo Recebimento</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um responsável" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {responsaveis.map((responsavel) => (
                        <SelectItem key={responsavel.id} value={responsavel.id.toString()}>
                          {responsavel.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
              {isSubmitting ? "Salvando..." : isEditMode ? "Atualizar Recebimento" : `Salvar ${adicionarEmMassa && valoresMassa.filter(v => v > 0).length > 0 ? `${valoresMassa.filter(v => v > 0).length + 1} Recebimentos` : "Recebimento"}`}
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
