import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTeamView } from "@/contexts/TeamViewContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldOff, Trash2, Search, RefreshCw, Filter, Eye } from "lucide-react";
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
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EnrichedUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
  is_blocked: boolean;
  role: 'admin' | 'user';
  profile: {
    nome: string | null;
    id_equipe: number | null;
    equipes: { nome: string } | null;
    equipe_nome?: string;
  } | null;
}

interface Team {
  id: number;
  nome: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<EnrichedUser | null>(null);
  const [actionType, setActionType] = useState<'block' | 'unblock' | 'delete' | 'promote' | 'demote' | null>(null);
  const { toast } = useToast();
  const { setViewingTeam } = useTeamView();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erro",
          description: "Sessão inválida",
          variant: "destructive"
        });
        return;
      }

      const response = await supabase.functions.invoke('admin-get-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (response.error) throw response.error;

      setUsers(response.data.users || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('equipes')
        .select('id, nome')
        .order('nome');

      if (error) throw error;
      setTeams(data || []);
    } catch (error: any) {
      console.error('Error fetching teams:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const handleAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sessão inválida');

      let functionName = 'admin-update-user';
      let body: any = { userId: selectedUser.id, action: actionType };

      if (actionType === 'promote' || actionType === 'demote') {
        functionName = 'admin-assign-role';
        const roleAction = actionType === 'promote' ? 'add' : 'remove';
        body = {
          userId: selectedUser.id,
          role: 'admin',
          action: roleAction
        };
      }

      const response = await supabase.functions.invoke(functionName, {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body
      });

      if (response.error) throw response.error;

      toast({
        title: "Sucesso",
        description: `Usuário ${actionType === 'delete' ? 'deletado' : 'atualizado'} com sucesso`
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Action error:', error);
      toast({
        title: "Erro",
        description: error.message || "Falha ao executar ação",
        variant: "destructive"
      });
    } finally {
      setSelectedUser(null);
      setActionType(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile?.nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTeam = selectedTeam === "all" || 
      user.profile?.id_equipe?.toString() === selectedTeam;
    
    return matchesSearch && matchesTeam;
  });

  const formatLastAccess = (lastSignIn: string | null) => {
    if (!lastSignIn) return 'Nunca';
    
    try {
      return formatDistanceToNow(new Date(lastSignIn), {
        addSuffix: true,
        locale: ptBR
      });
    } catch {
      return 'Data inválida';
    }
  };

  const handleViewAsTeam = (user: EnrichedUser) => {
    const teamId = user.profile?.id_equipe;
    const teamName = user.profile?.equipes?.nome || user.profile?.equipe_nome;
    
    if (teamId && teamName) {
      setViewingTeam(teamId, teamName);
      navigate("/");
      toast({
        title: "Modo de visualização ativado",
        description: `Agora você está visualizando os dados da equipe "${teamName}"`,
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os usuários do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por equipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as equipes</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={fetchUsers} variant="outline" size="icon">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Equipe</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead>Visualizar</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.profile?.nome || '-'}</TableCell>
                      <TableCell>{user.profile?.equipes?.nome || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.is_blocked ? (
                          <Badge variant="destructive">Bloqueado</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500">
                            Ativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatLastAccess(user.last_sign_in_at)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {user.profile?.id_equipe ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewAsTeam(user)}
                            title="Ver dados desta equipe"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {user.is_blocked ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setActionType('unblock');
                              }}
                            >
                              <ShieldOff className="h-4 w-4 mr-1" />
                              Desbloquear
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setActionType('block');
                              }}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Bloquear
                            </Button>
                          )}
                          {user.role === 'admin' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setActionType('demote');
                              }}
                            >
                              Remover Admin
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(user);
                                setActionType('promote');
                              }}
                            >
                              Tornar Admin
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setActionType('delete');
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!selectedUser && !!actionType} onOpenChange={() => {
        setSelectedUser(null);
        setActionType(null);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Ação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja {actionType} o usuário {selectedUser?.email}?
              {actionType === 'delete' && ' Esta ação não pode ser desfeita.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
