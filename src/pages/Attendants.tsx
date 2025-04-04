
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAttendants, Attendant } from "@/hooks/useAttendants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AttendantsTable from "@/components/attendants/AttendantsTable";
import EmptyAttendantsState from "@/components/attendants/EmptyAttendantsState";
import NewAttendantDialog from "@/components/attendants/NewAttendantDialog";
import DeleteAttendantDialog from "@/components/attendants/DeleteAttendantDialog";
import EditAttendantDialog from "@/components/attendants/EditAttendantDialog";

export default function Attendants() {
  const { toast } = useToast();
  const { attendants, loading, fetchAttendants, deleteAttendant } = useAttendants();
  
  const [newAttendantDialogOpen, setNewAttendantDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAttendant, setSelectedAttendant] = useState<Attendant | null>(null);

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

  const handleDeleteClick = (attendant: Attendant) => {
    setSelectedAttendant(attendant);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (attendant: Attendant) => {
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

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Atendentes</CardTitle>
          <Button onClick={handleOpenNewAttendantDialog}>
            <Plus className="mr-2 h-4 w-4" /> Novo Atendente
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">Carregando atendentes...</div>
          ) : attendants.length === 0 ? (
            <EmptyAttendantsState />
          ) : (
            <AttendantsTable 
              attendants={attendants}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
            />
          )}
        </CardContent>
      </Card>

      <NewAttendantDialog
        open={newAttendantDialogOpen}
        onOpenChange={setNewAttendantDialogOpen}
        onAttendantCreated={handleAttendantCreated}
      />
      
      <DeleteAttendantDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        attendant={selectedAttendant}
        onConfirm={handleDeleteConfirm}
      />

      <EditAttendantDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        attendant={selectedAttendant}
        onAttendantUpdated={handleAttendantUpdated}
      />
    </div>
  );
}
