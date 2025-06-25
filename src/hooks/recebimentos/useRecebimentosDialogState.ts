
import { useState } from "react";
import { Recebimento } from "@/types/recebimento.types";

export function useRecebimentosDialogState() {
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRecebimento, setEditingRecebimento] = useState<Recebimento | null>(null);
  const [deletingRecebimento, setDeletingRecebimento] = useState<Recebimento | null>(null);

  const openNewDialog = () => {
    setNewDialogOpen(true);
  };

  const openEditDialog = (recebimento: Recebimento) => {
    setEditingRecebimento(recebimento);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (recebimento: Recebimento) => {
    setDeletingRecebimento(recebimento);
    setDeleteDialogOpen(true);
  };

  const closeDialogs = () => {
    setNewDialogOpen(false);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    setEditingRecebimento(null);
    setDeletingRecebimento(null);
  };

  return {
    newDialogOpen,
    editDialogOpen,
    deleteDialogOpen,
    editingRecebimento,
    deletingRecebimento,
    openNewDialog,
    openEditDialog,
    openDeleteDialog,
    closeDialogs
  };
}
