
import { PlusCircle, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { NotesList } from "./notes/NotesList";
import { NoteForm } from "./notes/NoteForm";
import { useNotes } from "./notes/useNotes";

export function NotesAndReminders({ className, onOpenDialog }: { className?: string; onOpenDialog?: () => void }) {
  const { user } = useAuth();
  const { notesAndReminders, isLoading } = useDashboardData();
  const { open, setOpen, addNote, toggleComplete, deleteNote } = useNotes();

  // Se onOpenDialog foi passado, usamos ele
  const handleOpenDialog = () => {
    if (onOpenDialog) {
      onOpenDialog();
    }
    setOpen(true);
  };

  // Verifica se o usuário está autenticado
  if (!user) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Notas e Lembretes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Login necessário</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Você precisa estar autenticado para ver e adicionar notas e lembretes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Notas e Lembretes</CardTitle>
        <Button variant="ghost" size="icon" onClick={handleOpenDialog}>
          <PlusCircle className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <NotesList 
          notes={notesAndReminders || []}
          isLoading={isLoading}
          onToggleComplete={toggleComplete}
          onDelete={deleteNote}
          onAddClick={handleOpenDialog}
        />
        
        <NoteForm
          open={open}
          onOpenChange={setOpen}
          onAddNote={addNote}
        />
      </CardContent>
    </Card>
  );
}
