
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
import { useTeamView } from "@/contexts/TeamViewContext";

const formSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  porcentagem: z.number().min(0, "Porcentagem mínima é 0%").max(100, "Porcentagem máxima é 100%"),
  id_indicador: z.number().nullable().optional(),
  porcentagem_indicacao: z.number().min(0, "Porcentagem mínima é 0%").max(100, "Porcentagem máxima é 100%").default(0),
});

type FormValues = z.infer<typeof formSchema>;

interface NewAttendantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAttendantCreated: () => void;
}

export default function NewAttendantDialog({
  open,
  onOpenChange,
  onAttendantCreated,
}: NewAttendantDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendants, setAttendants] = useState<Array<{ id: number; nome: string }>>([]);
  const { viewingTeamId, isViewingAsTeam } = useTeamView();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      porcentagem: 10,
      id_indicador: null,
      porcentagem_indicacao: 0,
    },
  });

  // Fetch attendants for the indicator dropdown
  useEffect(() => {
    const fetchAttendants = async () => {
      if (!user) return;
      
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id_equipe")
          .eq("id", user.id)
          .single();

        if (!profileData?.id_equipe) return;

        const teamId = isViewingAsTeam && viewingTeamId ? viewingTeamId : profileData.id_equipe;

        const { data, error } = await supabase
          .from("pessoas")
          .select("id, nome")
          .eq("tipo", "atendente")
          .eq("id_equipe", teamId)
          .order("nome");

        if (error) throw error;
        setAttendants(data || []);
      } catch (error) {
        console.error("Erro ao carregar atendentes:", error);
      }
    };

    if (open) {
      fetchAttendants();
    }
  }, [open, user, isViewingAsTeam, viewingTeamId]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      // Primeiro, obtemos o id_equipe do usuário atual
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id_equipe")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      
      if (!profileData.id_equipe) {
        throw new Error("Usuário não possui equipe associada");
      }

      // Inserir o novo atendente
      const { error } = await supabase.from("pessoas").insert([
        {
          nome: data.nome,
          tipo: "atendente",
          id_equipe: profileData.id_equipe,
          porcentagem: data.porcentagem,
          id_indicador: data.id_indicador || null,
          porcentagem_indicacao: data.porcentagem_indicacao || 0,
        },
      ]);

      if (error) throw error;

      form.reset();
      onAttendantCreated();
    } catch (error: any) {
      console.error("Erro ao criar atendente:", error.message);
      toast({
        title: "Erro ao criar atendente",
        description: error.message || "Ocorreu um erro ao criar o atendente.",
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
          <DialogTitle>Adicionar Novo Atendente</DialogTitle>
          <DialogDescription>
            Adicione um novo atendente à sua equipe. Preencha o nome do atendente e defina sua porcentagem de comissão.
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
                    <Input placeholder="Nome do atendente" {...field} />
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
                      {attendants.map((att) => (
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
