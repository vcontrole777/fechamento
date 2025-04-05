
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";
import { paymentFormSchema, PaymentFormValues } from "./schemas/paymentFormSchema";
import { Payment } from "@/hooks/usePayments";
import { useAttendantsAndTripeiros } from "./hooks/useAttendantsAndTripeiros";
import { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";

interface PaymentFormProps {
  onSubmit: (
    values: PaymentFormValues, 
    attendantPercentage: number, 
    tripeiroPercentage: number
  ) => void;
  payment?: Payment;
  isSubmitting?: boolean;
}

export function PaymentForm({ onSubmit, payment, isSubmitting = false }: PaymentFormProps) {
  const { attendants, tripeiros } = useAttendantsAndTripeiros();
  const [selectedAttendantPercentage, setSelectedAttendantPercentage] = useState<number>(0);
  const [selectedTripeiroPercentage, setSelectedTripeiroPercentage] = useState<number>(0);
  const [useCustomTripeiroPercentage, setUseCustomTripeiroPercentage] = useState<boolean>(false);
  const [customTripeiroPercentage, setCustomTripeiroPercentage] = useState<number>(0);
  const [calculationPreview, setCalculationPreview] = useState<{
    totalValue: number;
    tripeiroCommission: number;
    tripeiroReceivable: number;
    attendantCommission: number;
    netValue: number;
  }>({
    totalValue: 0,
    tripeiroCommission: 0,
    tripeiroReceivable: 0,
    attendantCommission: 0,
    netValue: 0
  });

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: payment
      ? {
          data: new Date(payment.data),
          valor: payment.valor,
          id_atendente: payment.id_atendente?.toString() || undefined,
          id_tripeiro: payment.id_tripeiro?.toString() || undefined,
          tipo: payment.tipo,
          status: payment.status,
        }
      : {
          data: new Date(),
          valor: 0,
          tipo: "pix",
          status: "pendente",
        },
  });

  // Update selected percentages when attendant or tripeiro changes
  useEffect(() => {
    const attendantId = form.watch("id_atendente");
    const tripeiroId = form.watch("id_tripeiro");
    const totalValue = form.watch("valor");

    if (attendantId) {
      const attendant = attendants.find(a => a.id.toString() === attendantId);
      if (attendant) {
        setSelectedAttendantPercentage(attendant.porcentagem);
      }
    }

    if (tripeiroId) {
      const tripeiro = tripeiros.find(t => t.id.toString() === tripeiroId);
      if (tripeiro) {
        setSelectedTripeiroPercentage(tripeiro.porcentagem);
        if (!useCustomTripeiroPercentage) {
          setCustomTripeiroPercentage(tripeiro.porcentagem);
        }
      }
    }

    // Calculate payment values
    const tripeiroPercentageToUse = useCustomTripeiroPercentage ? customTripeiroPercentage : selectedTripeiroPercentage;
    updateCalculationPreview(totalValue, tripeiroPercentageToUse, selectedAttendantPercentage);
  }, [
    form.watch("id_atendente"), 
    form.watch("id_tripeiro"), 
    form.watch("valor"), 
    attendants, 
    tripeiros, 
    selectedAttendantPercentage, 
    useCustomTripeiroPercentage, 
    customTripeiroPercentage,
    selectedTripeiroPercentage
  ]);

  // Update calculation when custom percentage changes
  useEffect(() => {
    const totalValue = form.watch("valor");
    const tripeiroPercentageToUse = useCustomTripeiroPercentage ? customTripeiroPercentage : selectedTripeiroPercentage;
    updateCalculationPreview(totalValue, tripeiroPercentageToUse, selectedAttendantPercentage);
  }, [customTripeiroPercentage, useCustomTripeiroPercentage]);

  const updateCalculationPreview = (totalValue: number, tripeiroPercentage: number, attendantPercentage: number) => {
    if (!totalValue) return;

    const tripeiroCommission = totalValue * (tripeiroPercentage / 100);
    const tripeiroReceivable = totalValue - tripeiroCommission;
    const attendantCommission = tripeiroReceivable * (attendantPercentage / 100);
    const netValue = totalValue - tripeiroCommission - attendantCommission;

    setCalculationPreview({
      totalValue,
      tripeiroCommission,
      tripeiroReceivable,
      attendantCommission,
      netValue
    });
  };

  const handleSliderChange = (value: number[]) => {
    setCustomTripeiroPercentage(value[0]);
  };

  const handleSubmit = (values: PaymentFormValues) => {
    const tripeiroPercentageToSubmit = useCustomTripeiroPercentage 
      ? customTripeiroPercentage 
      : selectedTripeiroPercentage;
    
    onSubmit(values, selectedAttendantPercentage, tripeiroPercentageToSubmit);
  };

  return (
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
                    locale={ptBR}
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
              <FormLabel>Valor Total</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="id_atendente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Atendente</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um atendente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {attendants.map((attendant) => (
                      <SelectItem key={attendant.id} value={attendant.id.toString()}>
                        {attendant.nome} ({attendant.porcentagem}%)
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
            name="id_tripeiro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tripeiro</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Reset custom percentage when changing tripeiros
                    setUseCustomTripeiroPercentage(false);
                  }}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tripeiro" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {tripeiros.map((tripeiro) => (
                      <SelectItem key={tripeiro.id} value={tripeiro.id.toString()}>
                        {tripeiro.nome} ({tripeiro.porcentagem}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {form.watch("id_tripeiro") && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="custom-percentage"
                checked={useCustomTripeiroPercentage}
                onChange={(e) => setUseCustomTripeiroPercentage(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="custom-percentage" className="text-sm font-medium">
                Personalizar porcentagem do tripeiro
              </label>
            </div>

            {useCustomTripeiroPercentage && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Porcentagem: {customTripeiroPercentage}%</span>
                  <span className="text-sm font-medium">
                    (Padrão: {selectedTripeiroPercentage}%)
                  </span>
                </div>
                <Slider
                  value={[customTripeiroPercentage]}
                  min={0}
                  max={50}
                  step={0.5}
                  onValueChange={handleSliderChange}
                />
                <div className="flex gap-2 justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Pagamento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de pagamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {calculationPreview.totalValue > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-md space-y-2">
            <h3 className="font-semibold text-sm">Prévia do Cálculo:</h3>
            <div className="grid grid-cols-2 text-sm">
              <div>Comissão Tripeiro ({useCustomTripeiroPercentage ? customTripeiroPercentage : selectedTripeiroPercentage}%):</div>
              <div>R$ {calculationPreview.tripeiroCommission.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div className="grid grid-cols-2 text-sm">
              <div>Valor a Receber do Tripeiro:</div>
              <div>R$ {calculationPreview.tripeiroReceivable.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div className="grid grid-cols-2 text-sm">
              <div>Comissão Atendente ({selectedAttendantPercentage}%):</div>
              <div>R$ {calculationPreview.attendantCommission.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
            <div className="grid grid-cols-2 text-sm font-semibold">
              <div>Valor Líquido:</div>
              <div>R$ {calculationPreview.netValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {payment ? "Atualizar Pagamento" : "Adicionar Pagamento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
