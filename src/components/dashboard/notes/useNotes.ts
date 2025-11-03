
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export function useNotes() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Adicionar uma nova nota ou lembrete
  const addNote = async (
    title: string, 
    content: string, 
    isReminder: boolean, 
    reminderDate: string,
    notifyEnabled: boolean = false,
    notifyDaysBefore: number = 1
  ) => {
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
      notify_enabled: isReminder ? notifyEnabled : false,
      notify_days_before: isReminder ? notifyDaysBefore : 1,
    };

    try {
      // Using as any to bypass TypeScript type issues with Supabase
      const { error } = await supabase
        .from('notes_and_reminders')
        .insert(newNote as any);

      if (error) throw error;

      // Atualizar a lista de notas
      queryClient.invalidateQueries({ queryKey: ["notesAndReminders"] });
      
      setOpen(false);

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
      // Using as any to bypass TypeScript type issues with Supabase
      const { error } = await supabase
        .from('notes_and_reminders')
        .update({ completed: !completed, updated_at: new Date().toISOString() } as any)
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
      // Using as any to bypass TypeScript type issues with Supabase
      const { error } = await supabase
        .from('notes_and_reminders')
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

  return {
    open,
    setOpen,
    addNote,
    toggleComplete,
    deleteNote
  };
}
