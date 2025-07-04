import { useEffect, useState } from "react";
import { useUserRole } from "@/hooks/useUserRole";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Users, Building2, Settings, Calendar as CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Team {
  id: number;
  nome: string;
  criado_em: string;
  stats?: {
    total_atendentes: number;
    total_tripeiros: number;
    total_pagamentos: number;
    valor_pagamentos: number;
    total_despesas: number;
    valor_despesas: number;
    total_recebimentos: number;
    valor_recebimentos: number;
    usuarios_count: number;
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

interface Filters {
  equipe_id?: number;
  data_inicio?: Date;
  data_fim?: Date;
}

const Admin = () => {
  const { isAdmin, loading } = useUserRole();
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [allTeams, setAllTeams] = useState<{ id: number; nome: string }[]>([]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllTeams();
      fetchAdminData();
    }
  }, [isAdmin, filters]);

  const fetchAllTeams = async () => {
    try {
      const { data, error } = await supabase
        .from("equipes")
        .select("id, nome")
        .order("nome");

      if (error) throw error;
      setAllTeams(data || []);
    } catch (error) {
      console.error("Error fetching teams for filter:", error);
    }
  };

  const fetchAdminData = async () => {
    try {
      // Fetch teams with filters
      let teamsQuery = supabase
        .from("equipes")
        .select("*")
        .order("criado_em", { ascending: false });

      if (filters.equipe_id) {
        teamsQuery = teamsQuery.eq("id", filters.equipe_id);
      }

      const { data: teamsData, error: teamsError } = await teamsQuery;

      if (teamsError) throw teamsError;

      // Fetch team statistics
      const teamsWithStats = await Promise.all(
        (teamsData || []).map(async (team) => {
          // Count atendentes
          const { count: atendentesCount } = await supabase
            .from("pessoas")
            .select("*", { count: "exact", head: true })
            .eq("id_equipe", team.id)
            .eq("tipo", "atendente");

          // Count tripeiros
          const { count: tripeirosCount } = await supabase
            .from("pessoas")
            .select("*", { count: "exact", head: true })
            .eq("id_equipe", team.id)
            .eq("tipo", "tripeiro");

          // Count users in team
          const { count: usersCount } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("id_equipe", team.id);

          // Get pagamentos stats with date filter
          let pagamentosQuery = supabase
            .from("pagamentos")
            .select("valor")
            .eq("id_equipe", team.id);

          if (filters.data_inicio) {
            pagamentosQuery = pagamentosQuery.gte("data", format(filters.data_inicio, "yyyy-MM-dd"));
          }
          if (filters.data_fim) {
            pagamentosQuery = pagamentosQuery.lte("data", format(filters.data_fim, "yyyy-MM-dd"));
          }

          const { data: pagamentosData } = await pagamentosQuery;

          // Get despesas stats with date filter
          let despesasQuery = supabase
            .from("despesas")
            .select("valor")
            .eq("id_equipe", team.id);

          if (filters.data_inicio) {
            despesasQuery = despesasQuery.gte("data", format(filters.data_inicio, "yyyy-MM-dd"));
          }
          if (filters.data_fim) {
            despesasQuery = despesasQuery.lte("data", format(filters.data_fim, "yyyy-MM-dd"));
          }

          const { data: despesasData } = await despesasQuery;

          // Get recebimentos stats with date filter
          let recebimentosQuery = supabase
            .from("recebimentos")
            .select("valor")
            .eq("id_equipe", team.id);

          if (filters.data_inicio) {
            recebimentosQuery = recebimentosQuery.gte("data", format(filters.data_inicio, "yyyy-MM-dd"));
          }
          if (filters.data_fim) {
            recebimentosQuery = recebimentosQuery.lte("data", format(filters.data_fim, "yyyy-MM-dd"));
          }

          const { data: recebimentosData } = await recebimentosQuery;

          const pagamentosTotal = pagamentosData?.reduce((sum, p) => sum + Number(p.valor), 0) || 0;
          const despesasTotal = despesasData?.reduce((sum, d) => sum + Number(d.valor), 0) || 0;
          const recebimentosTotal = recebimentosData?.reduce((sum, r) => sum + Number(r.valor), 0) || 0;

          return {
            ...team,
            stats: {
              total_atendentes: atendentesCount || 0,
              total_tripeiros: tripeirosCount || 0,
              total_pagamentos: pagamentosData?.length || 0,
              valor_pagamentos: pagamentosTotal,
              total_despesas: despesasData?.length || 0,
              valor_despesas: despesasTotal,
              total_recebimentos: recebimentosData?.length || 0,
              valor_recebimentos: recebimentosTotal,
              usuarios_count: usersCount || 0,
            }
          };
        })
      );

      // Fetch users with team info and filters
      let usersQuery = supabase
        .from("profiles")
        .select(`
          id,
          nome,
          role,
          id_equipe,
          equipes:id_equipe(nome)
        `)
        .order("nome");

      if (filters.equipe_id) {
        usersQuery = usersQuery.eq("id_equipe", filters.equipe_id);
      }

      const { data: usersData, error: usersError } = await usersQuery;

      if (usersError) throw usersError;

      setTeams(teamsWithStats);
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

  const clearFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

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

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="ml-auto"
              >
                <X className="w-4 h-4 mr-1" />
                Limpar Filtros
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Team Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Equipe</label>
              <Select
                value={filters.equipe_id?.toString() || ""}
                onValueChange={(value) =>
                  setFilters({ ...filters, equipe_id: value ? Number(value) : undefined })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as equipes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as equipes</SelectItem>
                  {allTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date From Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Início</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.data_inicio && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.data_inicio ? (
                      format(filters.data_inicio, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecionar data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.data_inicio}
                    onSelect={(date) => setFilters({ ...filters, data_inicio: date })}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Fim</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.data_fim && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.data_fim ? (
                      format(filters.data_fim, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecionar data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.data_fim}
                    onSelect={(date) => setFilters({ ...filters, data_fim: date })}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {loadingData ? (
        <div className="text-center py-12">Carregando dados...</div>
      ) : (
        <div className="grid gap-6">
          {/* Teams Section - Full Width */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Equipes ({teams.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="p-4 border rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{team.nome}</h3>
                      <Badge variant="outline">ID: {team.id}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Usuários:</span>
                        <span className="font-medium">{team.stats?.usuarios_count || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Atendentes:</span>
                        <span className="font-medium">{team.stats?.total_atendentes || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tripeiros:</span>
                        <span className="font-medium">{team.stats?.total_tripeiros || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pagamentos:</span>
                        <span className="font-medium">{team.stats?.total_pagamentos || 0}</span>
                      </div>
                    </div>

                    <div className="space-y-1 text-sm border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pagamentos:</span>
                        <span className="font-medium text-green-600">
                          R$ {(team.stats?.valor_pagamentos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Despesas:</span>
                        <span className="font-medium text-red-600">
                          R$ {(team.stats?.valor_despesas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Recebimentos:</span>
                        <span className="font-medium text-blue-600">
                          R$ {(team.stats?.valor_recebimentos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground border-t pt-2">
                      Criada em {new Date(team.criado_em).toLocaleDateString('pt-BR')}
                    </div>
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