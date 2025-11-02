import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const passwordSchema = z.object({
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function SecuritySection() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "", color: "" };
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

    if (strength < 40) return { strength, label: "Fraca", color: "bg-red-500" };
    if (strength < 70) return { strength, label: "Média", color: "bg-yellow-500" };
    return { strength, label: "Forte", color: "bg-green-500" };
  };

  const passwordValue = form.watch("password");
  const passwordStrength = getPasswordStrength(passwordValue);

  const onPasswordSubmit = async (values: PasswordFormValues) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password
      });

      if (error) throw error;

      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso.",
      });
      
      form.reset();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle>Segurança</CardTitle>
        </div>
        <CardDescription>Altere sua senha e gerencie a segurança da conta</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                  
                  {/* Password Strength Indicator */}
                  {passwordValue && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Força da senha:</span>
                        <span className={`font-medium ${
                          passwordStrength.strength < 40 ? 'text-red-500' :
                          passwordStrength.strength < 70 ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <Progress value={passwordStrength.strength} className="h-2" />
                      
                      {/* Requirements */}
                      <div className="space-y-1 text-xs">
                        <div className={`flex items-center gap-1 ${passwordValue.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {passwordValue.length >= 8 ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span>Mínimo 8 caracteres</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/[A-Z]/.test(passwordValue) && /[a-z]/.test(passwordValue) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {/[A-Z]/.test(passwordValue) && /[a-z]/.test(passwordValue) ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span>Letras maiúsculas e minúsculas</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/\d/.test(passwordValue) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {/\d/.test(passwordValue) ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span>Pelo menos um número</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/[^a-zA-Z0-9]/.test(passwordValue) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {/[^a-zA-Z0-9]/.test(passwordValue) ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          <span>Caractere especial (!@#$%)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nova Senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
