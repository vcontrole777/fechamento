
import { useState } from "react";
import { ContaBancaria } from "@/types/conta-bancaria.types";

export function useContasBancariasDialogState() {
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<ContaBancaria | null>(null);
  const [deletingConta, setDeletingConta] = useState<ContaBancaria | null>(null);

  const openNewDialog = () => {
    setNewDialogOpen(true);
  };

  const openEditDialog = (conta: ContaBancaria) => {
    setEditingConta(conta);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (conta: ContaBancaria) => {
    setDeletingConta(conta);
    setDeleteDialogOpen(true);
  };

  const closeDialogs = () => {
    setNewDialogOpen(false);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    setEditingConta(null);
    setDeletingConta(null);
  };

  return {
    newDialogOpen,
    editDialogOpen,
    deleteDialogOpen,
    editingConta,
    deletingConta,
    openNewDialog,
    openEditDialog,
    openDeleteDialog,
    closeDialogs
  };
}
