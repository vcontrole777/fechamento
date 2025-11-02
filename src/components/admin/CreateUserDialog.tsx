import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
  teamOption: z.enum(["existing", "new"]),
  existingTeamId: z.string().optional(),
  newTeamName: z.string().optional(),
  isAdmin: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.teamOption === "existing" && !data.existingTeamId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Selecione uma equipe",
      path: ["existingTeamId"],
    });
  }
  if (data.teamOption === "new" && !data.newTeamName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Digite o nome da nova equipe",
      path: ["newTeamName"],
    });
  }
});

interface CreateUserDialogProps {
  teams: { id: number; nome: string }[];
  onSuccess: () => void;
}

export function CreateUserDialog({ teams, onSuccess }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      nome: "",
      teamOption: "existing",
      existingTeamId: "",
      newTeamName: "",
      isAdmin: false,
    },
  });

  const teamOption = form.watch("teamOption");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('Form submitted with values:', values);
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Sessão inválida");

      console.log('Calling admin-create-user function...');
      const response = await supabase.functions.invoke('admin-create-user', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: {
          email: values.email,
          password: values.password,
          nome: values.nome,
          teamOption: values.teamOption,
          existingTeamId: values.existingTeamId ? parseInt(values.existingTeamId) : undefined,
          newTeamName: values.newTeamName,
          isAdmin: values.isAdmin,
        }
      });

      console.log('Function response:', response);

      if (response.error) throw response.error;

      toast({
        title: "Usuário criado com sucesso",
        description: `${values.email} foi criado e adicionado à equipe`,
      });

      form.reset();
      setOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Criar Usuário
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Usuário</DialogTitle>
          <DialogDescription>
            Crie um novo usuário e atribua a uma equipe existente ou crie uma nova equipe
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="usuario@exemplo.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teamOption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipe</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="existing">Equipe Existente</SelectItem>
                      <SelectItem value="new">Criar Nova Equipe</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {teamOption === "existing" && (
              <FormField
                control={form.control}
                name="existingTeamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selecionar Equipe</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma equipe" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {teamOption === "new" && (
              <FormField
                control={form.control}
                name="newTeamName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Nova Equipe</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da equipe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="isAdmin"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Administrador</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Dar privilégios de administrador
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar Usuário"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
