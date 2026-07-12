
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWorkers, Worker } from "@/hooks/workers/useWorkers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, DollarSign, Clock, TrendingUp } from "lucide-react";
import AttendantsTable from "@/components/attendants/AttendantsTable";
import EmptyAttendantsState from "@/components/attendants/EmptyAttendantsState";
import { WorkerFormDialog } from "@/components/workers/WorkerFormDialog";
import DeleteAttendantDialog from "@/components/attendants/DeleteAttendantDialog";
import { StatsCard } from "@/components/common/StatsCard";
import { SearchBar } from "@/components/common/SearchBar";
import { useAttendantStats } from "@/hooks/attendants/useAttendantStats";
import { formatCurrency } from "@/utils/currency";

export default function Attendants() {
  const { toast } = useToast();
  const { workers: attendants, loading, fetchWorkers: fetchAttendants, deleteWorker: deleteAttendant } = useWorkers("atendente");
  const { data: stats } = useAttendantStats();

  const [newAttendantDialogOpen, setNewAttendantDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAttendant, setSelectedAttendant] = useState<Worker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenNewAttendantDialog = () => {
    setNewAttendantDialogOpen(true);
  };

  const handleAttendantCreated = () => {
    fetchAttendants();
    setNewAttendantDialogOpen(false);
    toast({
      title: "Atendente adicionado",
      description: "O atendente foi adicionado com sucesso.",
    });
  };

  const handleDeleteClick = (attendant: Worker) => {
    setSelectedAttendant(attendant);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (attendant: Worker) => {
    setSelectedAttendant(attendant);
    setEditDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAttendant) return;

    const result = await deleteAttendant(selectedAttendant.id);

    if (result.success) {
      setDeleteDialogOpen(false);
      toast({
        title: "Atendente removido",
        description: "O atendente foi removido com sucesso.",
      });
    } else {
      toast({
        title: "Erro ao remover atendente",
        description: "Não foi possível remover o atendente.",
        variant: "destructive",
      });
    }
  };

  const handleAttendantUpdated = () => {
    fetchAttendants();
    setEditDialogOpen(false);
    setSelectedAttendant(null);
  };

  const filteredAttendants = useMemo(() => {
    if (!searchQuery) return attendants;
    
    const query = searchQuery.toLowerCase();
    return attendants.filter(attendant => 
      attendant.nome.toLowerCase().includes(query)
    );
  }, [attendants, searchQuery]);

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Atendentes"
          value={stats?.totalAttendants || 0}
          icon={Users}
          description="Cadastrados no sistema"
        />
        <StatsCard
          title="Comissões Pagas"
          value={formatCurrency(stats?.totalCommissionsPaid || 0)}
          icon={DollarSign}
          description={`${stats?.totalPayments || 0} pagamentos`}
        />
        <StatsCard
          title="Comissões Pendentes"
          value={formatCurrency(stats?.totalCommissionsPending || 0)}
          icon={Clock}
          description="Aguardando pagamento"
        />
        <StatsCard
          title="Média por Atendente"
          value={formatCurrency(
            stats?.totalAttendants ? (stats.totalCommissionsPaid / stats.totalAttendants) : 0
          )}
          icon={TrendingUp}
          description="Comissão média"
        />
      </div>

      {/* Main Card */}
      <Card className="glow-card border-2 border-primary">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="glow-text">Atendentes</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar atendente..."
              />
              <Button onClick={handleOpenNewAttendantDialog} className="glow-border">
                <Plus className="mr-2 h-4 w-4" /> Novo Atendente
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-pulse text-muted-foreground">Carregando atendentes...</div>
            </div>
          ) : filteredAttendants.length === 0 ? (
            searchQuery ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum atendente encontrado para "{searchQuery}"
              </div>
            ) : (
              <EmptyAttendantsState />
            )
          ) : (
            <AttendantsTable 
              attendants={filteredAttendants}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
            />
          )}
        </CardContent>
      </Card>

      <WorkerFormDialog
        tipo="atendente"
        open={newAttendantDialogOpen}
        onOpenChange={setNewAttendantDialogOpen}
        onSaved={handleAttendantCreated}
      />

      <DeleteAttendantDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        attendant={selectedAttendant}
        onConfirm={handleDeleteConfirm}
      />

      <WorkerFormDialog
        tipo="atendente"
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        worker={selectedAttendant}
        onSaved={handleAttendantUpdated}
      />
    </div>
  );
}
