import { useState } from "react";

export function useNoteDialog() {
  const [open, setOpen] = useState(false);

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  return {
    open,
    openDialog,
    closeDialog,
    setOpen,
  };
}