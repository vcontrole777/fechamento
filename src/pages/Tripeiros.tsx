
import { useState, useMemo } from "react";
import { useTripeiros, Tripeiro } from "@/hooks/useTripeiros";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, DollarSign, Clock, TrendingUp } from "lucide-react";
import NewTrypeiroDialog from "@/components/tripeiros/NewTrypeiroDialog";
import DeleteTrypeiroDialog from "@/components/tripeiros/DeleteTrypeiroDialog";
import EditTrypeiroDialog from "@/components/tripeiros/EditTrypeiroDialog";
import TripeirosTable from "@/components/tripeiros/TripeirosTable";
import EmptyTripeirosState from "@/components/tripeiros/EmptyTripeirosState";
import { StatsCard } from "@/components/common/StatsCard";
import { SearchBar } from "@/components/common/SearchBar";
import { useTripeiroStats } from "@/hooks/tripeiros/useTripeiroStats";

export default function Tripeiros() {
  const { toast } = useToast();
  const { tripeiros, loading, fetchTripeiros } = useTripeiros();
  const { data: stats } = useTripeiroStats();
  const [newTrypeiroDialogOpen, setNewTrypeiroDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTripeiro, setSelectedTripeiro] = useState<Tripeiro | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenNewTrypeiroDialog = () => {
    setNewTrypeiroDialogOpen(true);
  };

  const handleTrypeiroCreated = () => {
    fetchTripeiros();
    setNewTrypeiroDialogOpen(false);
  };

  const handleDeleteClick = (tripeiro: Tripeiro) => {
    setSelectedTripeiro(tripeiro);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (tripeiro: Tripeiro) => {
    setSelectedTripeiro(tripeiro);
    setEditDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTripeiro) return;
    
    try {
      const { error } = await supabase
        .from("pessoas")
        .delete()
        .eq("id", selectedTripeiro.id);
      
      if (error) throw error;
      
      fetchTripeiros();
      setDeleteDialogOpen(false);
      toast({
        title: "Tripeiro removido",
        description: "O tripeiro foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao remover tripeiro:", error);
      toast({
        title: "Erro ao remover tripeiro",
        description: "Não foi possível remover o tripeiro.",
        variant: "destructive",
      });
    }
  };

  const handleTrypeiroUpdated = () => {
    fetchTripeiros();
    setEditDialogOpen(false);
    setSelectedTripeiro(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredTripeiros = useMemo(() => {
    if (!searchQuery) return tripeiros;
    
    const query = searchQuery.toLowerCase();
    return tripeiros.filter(tripeiro => 
      tripeiro.nome.toLowerCase().includes(query)
    );
  }, [tripeiros, searchQuery]);

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Tripeiros"
          value={stats?.totalTripeiros || 0}
          icon={Users}
          description="Cadastrados no sistema"
        />
        <StatsCard
          title="Total Pago"
          value={formatCurrency(stats?.totalPaid || 0)}
          icon={DollarSign}
          description={`${stats?.totalPayments || 0} pagamentos`}
        />
        <StatsCard
          title="Pendente"
          value={formatCurrency(stats?.totalPending || 0)}
          icon={Clock}
          description="Aguardando pagamento"
        />
        <StatsCard
          title="Média por Tripeiro"
          value={formatCurrency(
            stats?.totalTripeiros ? (stats.totalPaid / stats.totalTripeiros) : 0
          )}
          icon={TrendingUp}
          description="Pagamento médio"
        />
      </div>

      {/* Main Card */}
      <Card className="glow-card border-2 border-primary">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="glow-text">Tripeiros</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar tripeiro..."
              />
              <Button onClick={handleOpenNewTrypeiroDialog} className="glow-border">
                <Plus className="mr-2 h-4 w-4" /> Novo Tripeiro
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-pulse text-muted-foreground">Carregando tripeiros...</div>
            </div>
          ) : filteredTripeiros.length === 0 ? (
            searchQuery ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum tripeiro encontrado para "{searchQuery}"
              </div>
            ) : (
              <EmptyTripeirosState />
            )
          ) : (
            <TripeirosTable 
              tripeiros={filteredTripeiros}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
            />
          )}
        </CardContent>
      </Card>

      <NewTrypeiroDialog
        open={newTrypeiroDialogOpen}
        onOpenChange={setNewTrypeiroDialogOpen}
        onTrypeiroCreated={handleTrypeiroCreated}
      />
      
      <DeleteTrypeiroDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        tripeiro={selectedTripeiro}
        onConfirm={handleDeleteConfirm}
      />

      <EditTrypeiroDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        tripeiro={selectedTripeiro}
        onTrypeiroUpdated={handleTrypeiroUpdated}
      />
    </div>
  );
}
