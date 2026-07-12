import { Bell, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useUpcomingReminders } from "@/hooks/useUpcomingReminders";
import { NoteForm } from "./notes/NoteForm";
import { useNotes } from "./notes/useNotes";

const urgencyColors = {
  today: "destructive",
  tomorrow: "default",
  soon: "secondary",
  upcoming: "outline",
} as const;

const urgencyLabels = {
  today: "Hoje",
  tomorrow: "Amanhã",
  soon: "Próximos dias",
  upcoming: "Em breve",
};

export function RemindersCard({ className }: { className?: string }) {
  const { data: reminders, isLoading } = useUpcomingReminders();
  const { open, setOpen, addNote, toggleComplete } = useNotes();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="h-5 w-5" />
          Lembretes
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Plus className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : !reminders || reminders.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum lembrete próximo
          </p>
        ) : (
          reminders.slice(0, 5).map((reminder) => (
            <button
              key={reminder.id}
              type="button"
              onClick={() => toggleComplete(reminder.id, false)}
              className="flex w-full items-start justify-between gap-2 rounded-lg border border-transparent p-2 text-left transition-colors hover:border-border hover:bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-tight">{reminder.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(reminder.date), "dd 'de' MMM", { locale: ptBR })}
                </p>
              </div>
              <Badge variant={urgencyColors[reminder.urgency]} className="shrink-0 text-xs">
                {urgencyLabels[reminder.urgency]}
              </Badge>
            </button>
          ))
        )}
      </CardContent>
      <NoteForm open={open} onOpenChange={setOpen} onAddNote={addNote} />
    </Card>
  );
}
