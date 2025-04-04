
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

const formSchema = z.object({
  nome: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  porcentagem: z.number().min(0, "Porcentagem mínima é 0%").max(100, "Porcentagem máxima é 100%"),
});

type FormValues = z.infer<typeof formSchema>;

interface Tripeiro {
  id: number;
  nome: string;
  porcentagem: number;
  id_equipe: number;
  criado_em: string;
}

interface EditTrypeiroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTrypeiroUpdated: () => void;
  tripeiro: Tripeiro | null;
}

export default function EditTrypeiroDialog({
  open,
  onOpenChange,
  onTrypeiroUpdated,
  tripeiro,
}: EditTrypeiroDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: tripeiro?.nome || "",
      porcentagem: tripeiro?.porcentagem || 0,
    },
  });

  // Update form values when tripeiro changes
  useEffect(() => {
    if (tripeiro) {
      form.reset({
        nome: tripeiro.nome,
        porcentagem: tripeiro.porcentagem || 0,
      });
    }
  }, [tripeiro, form]);

  const onSubmit = async (data: FormValues) => {
    if (!user || !tripeiro) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("pessoas")
        .update({
          nome: data.nome,
          porcentagem: data.porcentagem,
        })
        .eq("id", tripeiro.id);

      if (error) throw error;

      onTrypeiroUpdated();
      toast({
        title: "Tripeiro atualizado",
        description: "As informações do tripeiro foram atualizadas com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao atualizar tripeiro:", error.message);
      toast({
        title: "Erro ao atualizar tripeiro",
        description: error.message || "Ocorreu um erro ao atualizar o tripeiro.",
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
          <DialogTitle>Editar Tripeiro</DialogTitle>
          <DialogDescription>
            Edite as informações do tripeiro. Você pode alterar o nome e a porcentagem de comissão.
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
