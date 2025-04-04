
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import NewAttendantDialog from "@/components/attendants/NewAttendantDialog";
import DeleteAttendantDialog from "@/components/attendants/DeleteAttendantDialog";

interface Attendant {
  id: number;
  nome: string;
  id_equipe: number;
  criado_em: string;
}

export default function Attendants() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAttendantDialogOpen, setNewAttendantDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAttendant, setSelectedAttendant] = useState<Attendant | null>(null);

  const fetchAttendants = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("pessoas")
        .select("*")
        .eq("tipo", "atendente")
        .order("nome");

      if (error) {
        throw error;
      }

      setAttendants(data as Attendant[]);
    } catch (error) {
      console.error("Erro ao buscar atendentes:", error);
      toast({
        title: "Erro ao carregar atendentes",
        description: "Não foi possível carregar a lista de atendentes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendants();
  }, []);

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

  const handleDeleteConfirm = async () => {
    if (!selectedAttendant) return;
    
    try {
      const { error } = await supabase
        .from("pessoas")
        .delete()
        .eq("id", selectedAttendant.id);
      
      if (error) throw error;
      
      fetchAttendants();
      setDeleteDialogOpen(false);
      toast({
        title: "Atendente removido",
        description: "O atendente foi removido com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao remover atendente:", error);
      toast({
        title: "Erro ao remover atendente",
        description: "Não foi possível remover o atendente.",
        variant: "destructive",
      });
    }
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
            <div className="text-center p-4">
              <p className="text-muted-foreground">Nenhum atendente encontrado.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Clique no botão "Novo Atendente" para adicionar um atendente.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendants.map((attendant) => (
                  <TableRow key={attendant.id}>
                    <TableCell className="font-medium">{attendant.nome}</TableCell>
                    <TableCell>
                      {new Date(attendant.criado_em).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(attendant)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
    </div>
  );
}
