import { useState } from "react";

export function useDialogState<T>() {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selected, setSelected] = useState<T | null>(null);

  const openAdd = () => setIsAdding(true);
  const closeAdd = () => setIsAdding(false);

  const openEdit = (item: T) => {
    setSelected(item);
    setIsEditing(true);
  };

  const closeEdit = () => {
    setIsEditing(false);
    setSelected(null);
  };

  const openDelete = (item: T) => {
    setSelected(item);
    setIsDeleting(true);
  };

  const closeDelete = () => {
    setIsDeleting(false);
    setSelected(null);
  };

  return {
    isAdding,
    isEditing,
    isDeleting,
    selected,
    openAdd,
    closeAdd,
    openEdit,
    closeEdit,
    openDelete,
    closeDelete,
  };
}
