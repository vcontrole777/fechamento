
import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface NoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNote: (
    title: string, 
    content: string, 
    isReminder: boolean, 
    reminderDate: string,
    notifyEnabled: boolean,
    notifyDaysBefore: number
  ) => Promise<void>;
}

export function NoteForm({ open, onOpenChange, onAddNote }: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isReminder, setIsReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(1);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setIsReminder(false);
    setReminderDate("");
    setNotifyEnabled(false);
    setNotifyDaysBefore(1);
  };

  const handleSubmit = async () => {
    await onAddNote(title, content, isReminder, reminderDate, notifyEnabled, notifyDaysBefore);
    resetForm();
  };

  const handleCancel = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <>
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
              
              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify" className="text-sm font-medium">
                      Ativar notificações
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receba lembretes antes da data
                    </p>
                  </div>
                  <Switch
                    id="notify"
                    checked={notifyEnabled}
                    onCheckedChange={setNotifyEnabled}
                  />
                </div>
                
                {notifyEnabled && (
                  <div className="grid gap-2">
                    <Label htmlFor="days" className="text-sm font-medium">
                      Notificar com antecedência
                    </Label>
                    <Select
                      value={notifyDaysBefore.toString()}
                      onValueChange={(value) => setNotifyDaysBefore(parseInt(value))}
                    >
                      <SelectTrigger id="days">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No dia</SelectItem>
                        <SelectItem value="1">1 dia antes</SelectItem>
                        <SelectItem value="3">3 dias antes</SelectItem>
                        <SelectItem value="7">7 dias antes</SelectItem>
                        <SelectItem value="14">14 dias antes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!title.trim() || (isReminder && !reminderDate)}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
