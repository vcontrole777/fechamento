
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const contaBancariaSchema = z.object({
  banco: z.string().min(1, "Banco é obrigatório"),
  agencia: z.string().min(1, "Agência é obrigatória"),
  conta: z.string().min(1, "Conta é obrigatória"),
  titular: z.string().min(1, "Titular é obrigatório"),
});

type ContaBancariaFormValues = z.infer<typeof contaBancariaSchema>;

interface ContaBancariaFormProps {
  onSubmit: (values: ContaBancariaFormValues) => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<ContaBancariaFormValues>;
}

export function ContaBancariaForm({ onSubmit, isSubmitting = false, defaultValues }: ContaBancariaFormProps) {
  const form = useForm<ContaBancariaFormValues>({
    resolver: zodResolver(contaBancariaSchema),
    defaultValues: {
      banco: defaultValues?.banco || "",
      agencia: defaultValues?.agencia || "",
      conta: defaultValues?.conta || "",
      titular: defaultValues?.titular || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="banco"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banco</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Banco do Brasil" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="agencia"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agência</FormLabel>
                <FormControl>
                  <Input placeholder="0000-0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="conta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Conta</FormLabel>
                <FormControl>
                  <Input placeholder="00000-0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="titular"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titular</FormLabel>
              <FormControl>
                <Input placeholder="Nome do titular da conta" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Conta"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
