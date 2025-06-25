
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
import { useResponsaveis } from "@/hooks/useResponsaveis";
import { useContasBancariasQuery } from "@/hooks/contas-bancarias/useContasBancariasQuery";
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
  const { tripeiros } = useTripeiros();
  const { responsaveis } = useResponsaveis();
  const { data: contas = [] } = useContasBancariasQuery();

  const form = useForm({
    resolver: zodResolver(recebimentoFormSchema),
    defaultValues: {
      id_tripeiro: initialData?.id_tripeiro || 0,
      valor: initialData?.valor || 0,
      data: initialData?.data || format(new Date(), "yyyy-MM-dd"),
      observacoes: initialData?.observacoes || "",
      conta_depositada: initialData?.conta_depositada || "",
      numero_comprovante: initialData?.numero_comprovante || "",
      banco: initialData?.banco || "",
      tipo_deposito: initialData?.tipo_deposito || "deposito",
      id_responsavel: initialData?.id_responsavel || undefined,
    },
  });

  const tipoDeposito = form.watch("tipo_deposito");

  const handleContaChange = (contaId: string) => {
    const conta = contas.find(c => c.id.toString() === contaId);
    if (conta) {
      form.setValue("banco", conta.banco);
      form.setValue("conta_depositada", `${conta.agencia} - ${conta.conta} (${conta.nome})`);
    }
  };

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

        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <FormField
          control={form.control}
          name="tipo_deposito"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Depósito</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
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

        {tipoDeposito === "especie" && (
          <FormField
            control={form.control}
            name="id_responsavel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Responsável pela Coleta</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
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

        {tipoDeposito !== "especie" && (
          <div className="space-y-4">
            <div>
              <Label>Conta Bancária</Label>
              <Select onValueChange={handleContaChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma conta cadastrada" />
                </SelectTrigger>
                <SelectContent>
                  {contas.map((conta) => (
                    <SelectItem key={conta.id} value={conta.id.toString()}>
                      {conta.banco} - {conta.agencia} - {conta.conta} ({conta.nome})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="banco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banco</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Banco do Brasil, Itaú..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conta_depositada"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conta Depositada</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 12345-6" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="numero_comprovante"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número do Comprovante</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

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
