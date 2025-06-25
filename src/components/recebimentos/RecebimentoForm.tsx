
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { recebimentoFormSchema } from "./schemas/recebimentoFormSchema";
import { Recebimento } from "@/types/recebimento.types";
import { useTripeiros } from "@/hooks/useTripeiros";
import { format } from "date-fns";

interface RecebimentoFormProps {
  initialData?: Recebimento;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function RecebimentoForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading
}: RecebimentoFormProps) {
  const { data: tripeiros = [] } = useTripeiros();

  const form = useForm({
    resolver: zodResolver(recebimentoFormSchema),
    defaultValues: {
      id_tripeiro: initialData?.id_tripeiro || 0,
      valor: initialData?.valor || 0,
      data: initialData?.data || format(new Date(), "yyyy-MM-dd"),
      observacoes: initialData?.observacoes || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="id_tripeiro"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tripeiro</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
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
          name="valor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor Recebido</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
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
          name="data"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data do Recebimento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
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
              <FormLabel>Observações (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observações sobre o recebimento..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
