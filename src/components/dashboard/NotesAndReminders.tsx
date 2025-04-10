
import { useState } from "react";
import { Bell, Calendar, CheckCircle, PlusCircle, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Note, useDashboardData } from "@/hooks/useDashboardData";

export function NotesAndReminders({ className }: { className?: string }) {
  const { user } = useAuth();
  const { notesAndReminders, isLoading } = useDashboardData();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isReminder, setIsReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const queryClient = useQueryClient();

  // Adicionar uma nova nota ou lembrete
  const handleAddNote = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para adicionar notas ou lembretes.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, insira um título para sua nota ou lembrete.",
        variant: "destructive",
      });
      return;
    }

    if (isReminder && !reminderDate) {
      toast({
        title: "Data obrigatória",
        description: "Por favor, selecione uma data para o lembrete.",
        variant: "destructive",
      });
      return;
    }

    const newNote = {
      title,
      content,
      date: isReminder ? reminderDate : format(new Date(), "yyyy-MM-dd"),
      is_reminder: isReminder,
      completed: false,
      user_id: user.id,
    };

    try {
      const { error } = await supabase
        .from("notes_and_reminders")
        .insert(newNote);

      if (error) throw error;

      // Atualizar a lista de notas
      queryClient.invalidateQueries({ queryKey: ["notesAndReminders"] });
      
      setOpen(false);
      resetForm();

      toast({
        title: isReminder ? "Lembrete criado" : "Nota adicionada",
        description: isReminder 
          ? `Lembrete "${title}" criado para ${format(new Date(reminderDate), "dd/MM/yyyy")}`
          : `Nota "${title}" adicionada com sucesso`,
      });
    } catch (error) {
      console.error("Erro ao adicionar nota:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a nota ou lembrete.",
        variant: "destructive",
      });
    }
  };

  // Marcar lembrete como concluído ou reabrir
  const toggleComplete = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("notes_and_reminders")
        .update({ completed: !completed, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      // Atualizar a lista de notas
      queryClient.invalidateQueries({ queryKey: ["notesAndReminders"] });

      toast({
        title: completed ? "Lembrete reaberto" : "Lembrete concluído",
        description: `Status do lembrete atualizado com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao atualizar lembrete:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do lembrete.",
        variant: "destructive",
      });
    }
  };

  // Excluir uma nota ou lembrete
  const deleteNote = async (id: string, title: string, isReminder: boolean) => {
    try {
      const { error } = await supabase
        .from("notes_and_reminders")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Atualizar a lista de notas
      queryClient.invalidateQueries({ queryKey: ["notesAndReminders"] });
      
      toast({
        title: isReminder ? "Lembrete excluído" : "Nota excluída",
        description: `"${title}" foi removido com sucesso.`
      });
    } catch (error) {
      console.error("Erro ao excluir nota:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a nota ou lembrete.",
        variant: "destructive",
      });
    }
  };

  // Resetar o formulário
  const resetForm = () => {
    setTitle("");
    setContent("");
    setIsReminder(false);
    setReminderDate("");
  };

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
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <PlusCircle className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <p>Carregando...</p>
          </div>
        ) : notesAndReminders && notesAndReminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Nenhuma nota ou lembrete</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              Adicione notas e lembretes para ajudar na sua organização diária.
            </p>
            <Button onClick={() => setOpen(true)} className="mt-4">
              Adicionar
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {notesAndReminders && notesAndReminders.map((note: Note) => (
              <div
                key={note.id}
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
                        onClick={() => toggleComplete(note.id, note.completed)}
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
                    onClick={() => deleteNote(note.id, note.title, note.is_reminder)}
                  >
                    <Trash className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dialog para adicionar nova nota/lembrete */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{isReminder ? "Novo Lembrete" : "Nova Nota"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                  <label htmlFor="type" className="text-sm font-medium">
                    Tipo
                  </label>
                  <div className="flex items-center space-x-4">
                    <Button
                      type="button"
                      variant={!isReminder ? "default" : "outline"}
                      onClick={() => setIsReminder(false)}
                      className="flex-1"
                    >
                      Nota
                    </Button>
                    <Button
                      type="button"
                      variant={isReminder ? "default" : "outline"}
                      onClick={() => setIsReminder(true)}
                      className="flex-1"
                    >
                      Lembrete
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Título
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título da nota"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Conteúdo
                </label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detalhes adicionais..."
                  rows={3}
                />
              </div>
              {isReminder && (
                <div className="grid gap-2">
                  <label htmlFor="date" className="text-sm font-medium">
                    Data do lembrete
                  </label>
                  <Input
                    id="date"
                    type="date"
                    value={reminderDate}
                    min={format(new Date(), "yyyy-MM-dd")}
                    onChange={(e) => setReminderDate(e.target.value)}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleAddNote} disabled={!title.trim() || (isReminder && !reminderDate)}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
