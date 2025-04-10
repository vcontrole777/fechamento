
import { format } from "date-fns";
import { Bell, Calendar, CheckCircle, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Note } from "@/hooks/useDashboardData";

interface NoteItemProps {
  note: Note;
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string, title: string, isReminder: boolean) => void;
}

export function NoteItem({ note, onToggleComplete, onDelete }: NoteItemProps) {
  // Verificar se um lembrete está próximo ou atrasado
  const getReminderStatus = (date: string) => {
    const reminderDate = new Date(date);
    const today = new Date();
    
    // Remover as horas, minutos e segundos para comparação apenas de datas
    reminderDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = reminderDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "atrasado";
    if (diffDays === 0) return "hoje";
    if (diffDays <= 3) return "proximo";
    return "futuro";
  };

  return (
    <div
      className={`p-3 rounded-lg border ${
        note.is_reminder
          ? note.completed
            ? "bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800"
            : getReminderStatus(note.date) === "atrasado"
            ? "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800"
            : getReminderStatus(note.date) === "hoje"
            ? "bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800"
            : getReminderStatus(note.date) === "proximo"
            ? "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800"
            : "bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800"
          : "bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800"
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-3">
          {note.is_reminder ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 rounded-full mt-0.5"
              onClick={() => onToggleComplete(note.id, note.completed)}
            >
              <CheckCircle
                className={`h-5 w-5 ${
                  note.completed
                    ? "text-green-500"
                    : "text-muted-foreground"
                }`}
              />
            </Button>
          ) : (
            <div className="h-5 w-5 rounded-full bg-primary mt-0.5" />
          )}
          <div>
            <h4
              className={`font-medium ${
                note.completed ? "line-through text-muted-foreground" : ""
              }`}
            >
              {note.title}
            </h4>
            {note.content && (
              <p
                className={`text-sm mt-1 ${
                  note.completed ? "line-through text-muted-foreground" : ""
                }`}
              >
                {note.content}
              </p>
            )}
            {note.is_reminder && (
              <div className="flex items-center mt-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(note.date), "dd/MM/yyyy")}
                {!note.completed && getReminderStatus(note.date) === "atrasado" && (
                  <span className="ml-2 text-red-500 font-medium">Atrasado</span>
                )}
                {!note.completed && getReminderStatus(note.date) === "hoje" && (
                  <span className="ml-2 text-orange-500 font-medium">Hoje</span>
                )}
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full"
          onClick={() => onDelete(note.id, note.title, note.is_reminder)}
        >
          <Trash className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
