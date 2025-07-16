import { useEffect, useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Users, Building2, Settings } from "lucide-react";

interface Team {
  id: number;
  nome: string;
  criado_em: string;
  _count?: {
    users: number;
    pagamentos: number;
    despesas: number;
  };
}

interface User {
  id: string;
  nome: string;
  role: 'admin' | 'user';
  id_equipe: number;
  equipe?: {
    nome: string;
  };
}

const Admin = () => {
  const { isAdmin, loading } = useUserRole();
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    try {
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from("equipes")
        .select("*")
        .order("criado_em", { ascending: false });

      if (teamsError) throw teamsError;

      // Fetch users with team info
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select(`
          id,
          nome,
          role,
          id_equipe,
          equipes:id_equipe(nome)
        `)
        .order("nome");

      if (usersError) throw usersError;

      setTeams(teamsData || []);
      setUsers(usersData || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados administrativos.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: 'admin' | 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Papel atualizado",
        description: `Usuário agora é ${newRole === 'admin' ? 'administrador' : 'usuário normal'}.`,
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Erro ao atualizar papel",
        description: "Não foi possível atualizar o papel do usuário.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Administração</h1>
        <Badge variant="secondary" className="text-sm">
          <Settings className="w-4 h-4 mr-1" />
          Acesso Administrativo
        </Badge>
      </div>

      {loadingData ? (
        <div className="text-center py-12">Carregando dados...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Teams Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Equipes ({teams.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{team.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        Criada em {new Date(team.criado_em).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant="outline">ID: {team.id}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Users Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Usuários ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{user.nome || 'Sem nome'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.equipe?.nome || 'Sem equipe'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Admin' : 'Usuário'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserRole(user.id, user.role)}
                      >
                        {user.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Admin;