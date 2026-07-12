
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Worker } from "@/hooks/workers/useWorkers";
import { WorkerType } from "@/hooks/workers/workerConfig";

const formSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  porcentagem: z.number().min(0, "Porcentagem mínima é 0%").max(100, "Porcentagem máxima é 100%"),
  id_indicador: z.number().nullable().optional(),
  porcentagem_indicacao: z.number().min(0, "Porcentagem mínima é 0%").max(100, "Porcentagem máxima é 100%").default(0),
});

type FormValues = z.infer<typeof formSchema>;

const LABEL: Record<WorkerType, string> = {
  atendente: "Atendente",
  tripeiro: "Tripeiro",
};

interface WorkerFormDialogProps {
  tipo: WorkerType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker?: Worker | null;
  onSaved: () => void;
}

export function WorkerFormDialog({ tipo, open, onOpenChange, worker, onSaved }: WorkerFormDialogProps) {
  const { toast } = useToast();
  const { ownTeamId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referrerOptions, setReferrerOptions] = useState<Array<{ id: number; nome: string }>>([]);
  const isEditing = !!worker;
  const isReferralEligible = tipo === "atendente";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: worker?.nome || "",
      porcentagem: worker?.porcentagem ?? 10,
      id_indicador: worker?.id_indicador || null,
      porcentagem_indicacao: worker?.porcentagem_indicacao || 0,
    },
  });

  // Update form values when the edited worker changes
  useEffect(() => {
    form.reset({
      nome: worker?.nome || "",
      porcentagem: worker?.porcentagem ?? 10,
      id_indicador: worker?.id_indicador || null,
      porcentagem_indicacao: worker?.porcentagem_indicacao || 0,
    });
  }, [worker, form]);

  // Fetch attendants for the indicator dropdown - always from the admin's own
  // team, since that's where the new/edited attendant lives
  useEffect(() => {
    if (!isReferralEligible) return;

    const fetchReferrers = async () => {
      if (!ownTeamId) return;

      try {
        let query = supabase
          .from("pessoas")
          .select("id, nome")
          .eq("tipo", "atendente")
          .eq("id_equipe", ownTeamId);

        if (worker) {
          query = query.neq("id", worker.id);
        }

        const { data, error } = await query.order("nome");

        if (error) throw error;
        setReferrerOptions(data || []);
      } catch (error) {
        console.error("Erro ao carregar atendentes:", error);
      }
    };

    if (open) {
      fetchReferrers();
    }
  }, [open, ownTeamId, worker, isReferralEligible]);

  const onSubmit = async (data: FormValues) => {
    if (!ownTeamId) return;

    setIsSubmitting(true);
    try {
      const payload = {
        nome: data.nome,
        porcentagem: data.porcentagem,
        ...(isReferralEligible
          ? {
              id_indicador: data.id_indicador || null,
              porcentagem_indicacao: data.porcentagem_indicacao || 0,
            }
          : {}),
      };

      const { error } = worker
        ? await supabase.from("pessoas").update(payload).eq("id", worker.id)
        : await supabase.from("pessoas").insert([{ ...payload, tipo, id_equipe: ownTeamId }]);

      if (error) throw error;

      toast({
        title: isEditing ? `${LABEL[tipo]} atualizado` : `${LABEL[tipo]} adicionado`,
        description: `As informações foram salvas com sucesso.`,
      });
      onSaved();
    } catch (error: any) {
      console.error(`Erro ao salvar ${tipo}:`, error.message);
      toast({
        title: `Erro ao salvar ${LABEL[tipo].toLowerCase()}`,
        description: error.message || "Ocorreu um erro ao salvar.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Editar ${LABEL[tipo]}` : `Adicionar Novo ${LABEL[tipo]}`}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Edite as informações do ${tipo}. Você pode alterar o nome e a porcentagem de comissão.`
              : `Adicione um novo ${tipo} à sua equipe. Preencha o nome e defina a porcentagem de comissão.`}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder={`Nome do ${tipo}`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="porcentagem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Porcentagem de comissão: {field.value}%</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="flex-grow"
                      />
                      <span className="w-12 text-center">{field.value}%</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isReferralEligible && (
              <>
                <FormField
                  control={form.control}
                  name="id_indicador"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indicado por (opcional)</FormLabel>
                      <Select
                        value={field.value?.toString() || "none"}
                        onValueChange={(value) => {
                          if (value === "none") {
                            field.onChange(null);
                            form.setValue("porcentagem_indicacao", 0);
                          } else {
                            field.onChange(parseInt(value));
                          }
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um atendente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {referrerOptions.map((att) => (
                            <SelectItem key={att.id} value={att.id.toString()}>
                              {att.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("id_indicador") && (
                  <FormField
                    control={form.control}
                    name="porcentagem_indicacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Porcentagem de indicação: {field.value}%</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <Slider
                              min={0}
                              max={50}
                              step={0.5}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="flex-grow"
                            />
                            <span className="w-12 text-center">{field.value}%</span>
                          </div>
                        </FormControl>
                        <p className="text-sm text-muted-foreground mt-1">
                          O indicador receberá esta porcentagem sobre a comissão do atendente
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
