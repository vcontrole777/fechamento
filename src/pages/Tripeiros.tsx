
import { useState } from "react";
import { useTripeiros, Tripeiro } from "@/hooks/useTripeiros";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import NewTrypeiroDialog from "@/components/tripeiros/NewTrypeiroDialog";
import DeleteTrypeiroDialog from "@/components/tripeiros/DeleteTrypeiroDialog";
import EditTrypeiroDialog from "@/components/tripeiros/EditTrypeiroDialog";
import TripeirosTable from "@/components/tripeiros/TripeirosTable";
import EmptyTripeirosState from "@/components/tripeiros/EmptyTripeirosState";

export default function Tripeiros() {
  const { toast } = useToast();
  const { tripeiros, loading, fetchTripeiros } = useTripeiros();
  const [newTrypeiroDialogOpen, setNewTrypeiroDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTripeiro, setSelectedTripeiro] = useState<Tripeiro | null>(null);

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

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tripeiros</CardTitle>
          <Button onClick={handleOpenNewTrypeiroDialog}>
            <Plus className="mr-2 h-4 w-4" /> Novo Tripeiro
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Carregando tripeiros...</div>
          ) : tripeiros.length === 0 ? (
            <EmptyTripeirosState />
          ) : (
            <TripeirosTable 
              tripeiros={tripeiros}
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
