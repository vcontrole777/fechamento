
import { Note } from "@/hooks/useDashboardData";
import { NoteItem } from "./NoteItem";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotesListProps {
  notes: Note[];
  isLoading: boolean;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string, title: string, isReminder: boolean) => void;
  onAddClick: () => void;
}

export function NotesList({ 
  notes, 
  isLoading, 
  onToggleComplete, 
  onDelete, 
  onAddClick 
}: NotesListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <p>Carregando...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="rounded-full bg-primary/10 p-3">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mt-4 text-lg font-medium">Nenhuma nota ou lembrete</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Adicione notas e lembretes para ajudar na sua organização diária.
        </p>
        <Button onClick={onAddClick} className="mt-4">
          Adicionar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
      {notes.map((note) => (
        <NoteItem 
          key={note.id} 
          note={note} 
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
