
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

const formSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
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

      // Inserir o novo atendente
      const { error } = await supabase.from("pessoas").insert([
        {
          nome: data.nome,
          tipo: "atendente",
          id_equipe: profileData.id_equipe,
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
            Adicione um novo atendente à sua equipe. Preencha o nome do atendente abaixo.
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
