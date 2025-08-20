
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Save, Shield, Download, Trash2 } from "lucide-react";
import { ClearDataDialog } from "@/components/ui/clear-data-dialog";
import { useClearTeamData } from "@/hooks/useClearTeamData";

const passwordSchema = z.object({
  password: z.string()
    .min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function AccountPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const { clearTeamData, loading: clearLoading } = useClearTeamData();
  const [profileData, setProfileData] = useState<{
    nome: string | null;
    id_equipe: number | null;
    equipeName: string | null;
  }>({
    nome: null,
    id_equipe: null,
    equipeName: null,
  });

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    async function loadProfileData() {
      if (!user) return;
      
      try {
        // Fetch profile data
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("nome, id_equipe")
          .eq("id", user.id)
          .single();
        
        if (profileError) throw profileError;
        
        let equipe = null;
        if (profile?.id_equipe) {
          // Fetch team name
          const { data: equipeData, error: equipeError } = await supabase
            .from("equipes")
            .select("nome")
            .eq("id", profile.id_equipe)
            .single();
            
          if (equipeError) throw equipeError;
          equipe = equipeData;
        }
        
        setProfileData({
          nome: profile?.nome || null,
          id_equipe: profile?.id_equipe || null,
          equipeName: equipe?.nome || null,
        });
      } catch (error) {
        console.error("Error loading profile data:", error);
        toast({
          title: "Erro ao carregar dados do perfil",
          description: "Não foi possível carregar os dados da sua conta",
          variant: "destructive",
        });
      }
    }
    
    loadProfileData();
  }, [user]);

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password: data.password });
      
      if (error) throw error;
      
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi atualizada com sucesso",
      });
      
      form.reset({
        password: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Erro ao atualizar senha",
        description: error.message || "Ocorreu um erro ao tentar atualizar sua senha",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadBackup = async () => {
    if (!user) return;
    
    try {
      setBackupLoading(true);
      
      // Fetch all data for backup
      const equipeId = profileData.id_equipe;
      
      const [
        { data: pagamentos, error: pagamentosError },
        { data: despesas, error: despesasError },
        { data: pessoas, error: pessoasError },
        { data: equipe, error: equipeError },
      ] = await Promise.all([
        supabase.from("pagamentos").select("*").eq("id_equipe", equipeId),
        supabase.from("despesas").select("*").eq("id_equipe", equipeId),
        supabase.from("pessoas").select("*").eq("id_equipe", equipeId),
        supabase.from("equipes").select("*").eq("id", equipeId).single(),
      ]);
      
      if (pagamentosError) throw pagamentosError;
      if (despesasError) throw despesasError;
      if (pessoasError) throw pessoasError;
      if (equipeError) throw equipeError;
      
      // Create backup object
      const backupData = {
        timestamp: new Date().toISOString(),
        equipe,
        dados: {
          pagamentos,
          despesas,
          pessoas,
        }
      };
      
      // Create and download JSON file
      const jsonData = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_sistema_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Backup realizado com sucesso",
        description: "O arquivo de backup foi gerado e baixado",
      });
    } catch (error: any) {
      console.error("Error generating backup:", error);
      toast({
        title: "Erro ao gerar backup",
        description: error.message || "Ocorreu um erro ao tentar gerar o backup dos dados",
        variant: "destructive",
      });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!profileData.id_equipe) return;
    
    const result = await clearTeamData(profileData.id_equipe);
    if (result.success) {
      // Optional: Reload the page or redirect to refresh data
      window.location.reload();
    }
  };

  return (
    <div className="container max-w-4xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Minha Conta</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
          <CardDescription>Detalhes da sua conta e equipe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Nome</h3>
              <p className="text-lg">{profileData.nome || "Não disponível"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
              <p className="text-lg">{user?.email || "Não disponível"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">ID da Equipe</h3>
              <p className="text-lg">{profileData.id_equipe || "Não disponível"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Nome da Equipe</h3>
              <p className="text-lg">{profileData.equipeName || "Não disponível"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>Atualize sua senha de acesso</CardDescription>
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
                      <Input type="password" placeholder="Digite sua nova senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Digite novamente sua nova senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={loading}>
                {loading ? "Atualizando..." : "Atualizar Senha"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Backup do Sistema
          </CardTitle>
          <CardDescription>Faça download de todos os dados do sistema em formato JSON</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            O arquivo de backup conterá todos os dados da sua equipe, incluindo pagamentos, despesas e pessoas cadastradas.
          </p>
          <Button 
            onClick={downloadBackup} 
            disabled={backupLoading || !profileData.id_equipe}
            className="w-full md:w-auto"
          >
            {backupLoading ? "Gerando backup..." : "Fazer Backup dos Dados"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>Ações irreversíveis que afetam todos os dados da equipe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
              <h4 className="font-medium text-destructive mb-2">Limpar Todos os Dados</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Remove permanentemente todos os dados da equipe: pagamentos, recebimentos, despesas, 
                contas bancárias e pessoas cadastradas. Esta ação não pode ser desfeita.
              </p>
              <ClearDataDialog
                onConfirm={handleClearData}
                loading={clearLoading}
                teamName={profileData.equipeName || "Equipe"}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
