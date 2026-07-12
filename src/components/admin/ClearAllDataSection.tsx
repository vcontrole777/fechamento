import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, AlertTriangle } from "lucide-react";
import { useClearAllData } from "@/hooks/useClearAllData";
import { useClearTeamData } from "@/hooks/useClearTeamData";
import { supabase } from "@/integrations/supabase/client";

interface Team {
  id: number;
  nome: string;
}

export function ClearAllDataSection() {
  const { clearAllData, loading: loadingAll } = useClearAllData();
  const { clearTeamData, loading: loadingTeam } = useClearTeamData();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [confirmTextAll, setConfirmTextAll] = useState("");
  const [confirmTextTeam, setConfirmTextTeam] = useState("");
  const [openAll, setOpenAll] = useState(false);
  const [openTeam, setOpenTeam] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from("equipes")
      .select("id, nome")
      .order("nome");
    
    if (!error && data) {
      setTeams(data);
    }
  };

  const handleConfirmAll = async () => {
    const result = await clearAllData();
    if (result.success) {
      setOpenAll(false);
      setConfirmTextAll("");
    }
  };

  const handleConfirmTeam = async () => {
    if (!selectedTeamId) return;
    const result = await clearTeamData(parseInt(selectedTeamId));
    if (result.success) {
      setOpenTeam(false);
      setConfirmTextTeam("");
      setSelectedTeamId("");
    }
  };

  const selectedTeam = teams.find(t => t.id.toString() === selectedTeamId);
  const isConfirmAllValid = confirmTextAll === "APAGAR TUDO";
  const isConfirmTeamValid = confirmTextTeam.toLowerCase() === "limpar dados";

  return (
    <div className="space-y-6">
      {/* Limpar dados de equipe específica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Limpar Dados de Equipe
          </CardTitle>
          <CardDescription>
            Remover todos os dados operacionais de uma equipe específica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="team-select">Selecione a equipe</Label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                  <SelectTrigger id="team-select" className="mt-1">
                    <SelectValue placeholder="Selecione uma equipe..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <AlertDialog open={openTeam} onOpenChange={setOpenTeam}>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={!selectedTeamId}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Limpar Dados
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive">
                        Limpar Dados da Equipe "{selectedTeam?.nome}"
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p className="font-medium">
                          Esta ação irá remover permanentemente os dados desta equipe:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Todos os pagamentos</li>
                          <li>Todas as despesas</li>
                          <li>Todas as pessoas (atendentes, tripeiros)</li>
                        </ul>
                        <p className="font-medium text-destructive">
                          Esta ação não pode ser desfeita!
                        </p>
                        <div className="mt-4">
                          <Label htmlFor="confirm-team" className="text-sm font-medium">
                            Para confirmar, digite "limpar dados":
                          </Label>
                          <Input
                            id="confirm-team"
                            value={confirmTextTeam}
                            onChange={(e) => setConfirmTextTeam(e.target.value)}
                            placeholder="limpar dados"
                            className="mt-2"
                          />
                        </div>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setConfirmTextTeam("")}>
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleConfirmTeam}
                        disabled={!isConfirmTeamValid || loadingTeam}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {loadingTeam ? "Limpando..." : "Confirmar Limpeza"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zona de Perigo - Limpar todos os dados */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>
            Ações irreversíveis que afetam todo o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <h4 className="font-medium text-destructive mb-2">
                Limpar Todos os Dados do Sistema
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Esta ação irá remover permanentemente TODOS os dados de TODAS as equipes:
                pagamentos, despesas, pessoas, notas e lembretes. As equipes e usuários
                serão mantidos, mas todos os dados operacionais serão apagados.
              </p>
              
              <AlertDialog open={openAll} onOpenChange={setOpenAll}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Todos os Dados
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Limpar TODOS os Dados do Sistema
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3">
                      <p className="font-medium text-foreground">
                        Esta é uma ação IRREVERSÍVEL que irá apagar:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Todos os pagamentos de todas as equipes</li>
                        <li>Todos os pagamentos de atendentes</li>
                        <li>Todos os pagamentos de tripeiros</li>
                        <li>Todas as despesas</li>
                        <li>Todas as pessoas (atendentes, tripeiros, responsáveis)</li>
                        <li>Todas as notas e lembretes</li>
                      </ul>
                      <p className="font-bold text-destructive">
                        ATENÇÃO: Esta ação NÃO pode ser desfeita!
                      </p>
                      <div className="mt-4">
                        <Label htmlFor="confirm-all" className="text-sm font-medium">
                          Para confirmar, digite <strong>APAGAR TUDO</strong>:
                        </Label>
                        <Input
                          id="confirm-all"
                          value={confirmTextAll}
                          onChange={(e) => setConfirmTextAll(e.target.value)}
                          placeholder="APAGAR TUDO"
                          className="mt-2"
                        />
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmTextAll("")}>
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleConfirmAll}
                      disabled={!isConfirmAllValid || loadingAll}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {loadingAll ? "Apagando..." : "Confirmar Exclusão"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
