
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
import NewTrypeiroDialog from "@/components/tripeiros/NewTrypeiroDialog";
import DeleteTrypeiroDialog from "@/components/tripeiros/DeleteTrypeiroDialog";
import EditTrypeiroDialog from "@/components/tripeiros/EditTrypeiroDialog";

interface Tripeiro {
  id: number;
  nome: string;
  id_equipe: number;
  criado_em: string;
  porcentagem: number;
}

export default function Tripeiros() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tripeiros, setTripeiros] = useState<Tripeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTrypeiroDialogOpen, setNewTrypeiroDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTripeiro, setSelectedTripeiro] = useState<Tripeiro | null>(null);

  const fetchTripeiros = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("pessoas")
        .select("*")
        .eq("tipo", "tripeiro")
        .order("nome");

      if (error) {
        throw error;
      }

      // Make sure to handle the porcentagem field
      const typedData = data.map(item => ({
        ...item,
        porcentagem: item.porcentagem || 0
      })) as Tripeiro[];

      setTripeiros(typedData);
    } catch (error) {
      console.error("Erro ao buscar tripeiros:", error);
      toast({
        title: "Erro ao carregar tripeiros",
        description: "Não foi possível carregar a lista de tripeiros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripeiros();
  }, []);

  const handleOpenNewTrypeiroDialog = () => {
    setNewTrypeiroDialogOpen(true);
  };

  const handleTrypeiroCreated = () => {
    fetchTripeiros();
    setNewTrypeiroDialogOpen(false);
    toast({
      title: "Tripeiro adicionado",
      description: "O tripeiro foi adicionado com sucesso.",
    });
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
            <div className="text-center p-4">
              <p className="text-muted-foreground">Nenhum tripeiro encontrado.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Clique no botão "Novo Tripeiro" para adicionar um tripeiro.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Comissão</TableHead>
                  <TableHead>Data de Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tripeiros.map((tripeiro) => (
                  <TableRow key={tripeiro.id}>
                    <TableCell className="font-medium">{tripeiro.nome}</TableCell>
                    <TableCell>{tripeiro.porcentagem || 0}%</TableCell>
                    <TableCell>
                      {new Date(tripeiro.criado_em).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(tripeiro)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(tripeiro)}
                        title="Excluir"
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
