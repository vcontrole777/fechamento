
import { useState } from "react";
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

const formSchema = z.object({
  nome: z.string().min(1, "O nome é obrigatório"),
  porcentagem: z.number().min(0, "Porcentagem mínima é 0%").max(100, "Porcentagem máxima é 100%"),
});

type FormValues = z.infer<typeof formSchema>;

interface NewTrypeiroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTrypeiroCreated: () => void;
}

export default function NewTrypeiroDialog({
  open,
  onOpenChange,
  onTrypeiroCreated,
}: NewTrypeiroDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      porcentagem: 10, // Valor padrão de 10%
    },
  });

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

      // Inserir o novo tripeiro
      const { error } = await supabase.from("pessoas").insert([
        {
          nome: data.nome,
          tipo: "tripeiro",
          id_equipe: profileData.id_equipe,
          porcentagem: data.porcentagem,
        },
      ]);

      if (error) throw error;

      form.reset();
      onTrypeiroCreated();
    } catch (error: any) {
      console.error("Erro ao criar tripeiro:", error.message);
      toast({
        title: "Erro ao criar tripeiro",
        description: error.message || "Ocorreu um erro ao criar o tripeiro.",
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
          <DialogTitle>Adicionar Novo Tripeiro</DialogTitle>
          <DialogDescription>
            Adicione um novo tripeiro à sua equipe. Preencha o nome do tripeiro e defina sua porcentagem de comissão.
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
                    <Input placeholder="Nome do tripeiro" {...field} />
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
