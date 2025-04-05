
import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CalendarIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { type Expense } from "@/hooks/useExpenses";

const TIMEZONE = "America/Sao_Paulo";

interface EditExpenseDialogProps {
  expense: Expense | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const formSchema = z.object({
  descricao: z.string().min(3, {
    message: "A descrição deve ter pelo menos 3 caracteres.",
  }),
  valor: z.coerce.number().positive({
    message: "O valor deve ser maior que zero.",
  }),
  data: z.date({
    required_error: "A data é obrigatória.",
  }),
  id_responsavel: z.string().optional(),
});

export default function EditExpenseDialog({
  expense,
  open,
  onOpenChange,
  onSuccess,
}: EditExpenseDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descricao: "",
      valor: undefined,
      data: toZonedTime(new Date(), TIMEZONE),
      id_responsavel: undefined,
    },
  });

  useEffect(() => {
    if (expense) {
      const parsedDate = parse(expense.data, "yyyy-MM-dd", new Date());
      const zonedDate = toZonedTime(parsedDate, TIMEZONE);
      
      form.reset({
        descricao: expense.descricao,
        valor: expense.valor,
        data: zonedDate,
        id_responsavel: expense.id_responsavel?.toString(),
      });
    }
  }, [expense, form]);

  const { data: responsaveis, isLoading: isLoadingResponsaveis } = useQuery({
    queryKey: ["responsaveis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome")
        .eq("tipo", "responsavel")
        .order("nome");

      if (error) {
        toast({
          title: "Erro ao carregar responsáveis",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!expense) return;

    const { data, error } = await supabase
      .from("despesas")
      .update({
        descricao: values.descricao,
        valor: values.valor,
        data: format(values.data, "yyyy-MM-dd"),
        id_responsavel: values.id_responsavel ? parseInt(values.id_responsavel) : null,
        // We don't need to update id_equipe since it's already set and shouldn't change
      })
      .eq("id", expense.id);

    if (error) {
      toast({
        title: "Erro ao atualizar despesa",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Despesa atualizada",
      description: "A despesa foi atualizada com sucesso.",
    });

    form.reset();
    onOpenChange(false);
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Despesa</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição da despesa" {...field} />
                  </FormControl>
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
                      placeholder="0,00"
                      {...field}
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
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
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
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_responsavel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsável</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um responsável" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {responsaveis?.map((responsavel) => (
                        <SelectItem
                          key={responsavel.id}
                          value={responsavel.id.toString()}
                        >
                          {responsavel.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
