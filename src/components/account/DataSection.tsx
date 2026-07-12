import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useClearTeamData } from "@/hooks/useClearTeamData";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DataSectionProps {
  teamId: string;
}

export function DataSection({ teamId }: DataSectionProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { clearTeamData } = useClearTeamData();
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);

  const downloadBackup = async () => {
    if (!user) return;
    
    setIsBackupLoading(true);
    try {
      const teamIdNum = parseInt(teamId);
      
      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Fetch all team data
      const [paymentsRes, expensesRes, peopleRes, teamRes] = await Promise.all([
        supabase.from('pagamentos').select('*').eq('id_equipe', teamIdNum),
        supabase.from('despesas').select('*').eq('id_equipe', teamIdNum),
        supabase.from('pessoas').select('*').eq('id_equipe', teamIdNum),
        supabase.from('equipes').select('*').eq('id', teamIdNum).single(),
      ]);

      const backupData = {
        exportDate: new Date().toISOString(),
        profile: profile,
        team: teamRes.data,
        payments: paymentsRes.data || [],
        expenses: expensesRes.data || [],
        people: peopleRes.data || [],
      };

      // Create and download the backup file
      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup-${teamId}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup concluído",
        description: "Seus dados foram exportados com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer backup",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsBackupLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!teamId) return;
    
    try {
      await clearTeamData(parseInt(teamId));
      setShowClearDialog(false);
      toast({
        title: "Dados limpos",
        description: "Todos os dados da equipe foram removidos.",
      });
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      toast({
        title: "Erro ao limpar dados",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>Gerenciamento de Dados</CardTitle>
          </div>
          <CardDescription>
            Exporte ou limpe os dados da sua equipe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <Download className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium mb-1">Exportar Dados</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Faça download de todos os dados da sua equipe em formato JSON. 
                  Inclui pagamentos, despesas, pessoas e informações da equipe.
                </p>
                <Button 
                  variant="outline" 
                  onClick={downloadBackup}
                  disabled={isBackupLoading}
                >
                  {isBackupLoading ? "Exportando..." : "Baixar Backup"}
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 border border-destructive/50 rounded-lg bg-destructive/5">
              <Trash2 className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium mb-1 text-destructive">Zona de Perigo</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Limpar todos os dados da equipe. Esta ação é irreversível.
                  Recomendamos fazer um backup antes de prosseguir.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowClearDialog(true)}
                >
                  Limpar Todos os Dados
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá permanentemente deletar todos os dados
              da sua equipe, incluindo pagamentos, despesas e cadastros de pessoas.
              <br /><br />
              <strong>Recomendamos fazer um backup antes de continuar.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearData}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, limpar todos os dados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
