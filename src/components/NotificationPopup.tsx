import { useEffect, useState } from "react";
import { useSystemNotifications } from "@/hooks/useSystemNotifications";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const notificationTypeColors = {
  info: 'text-blue-500 bg-blue-500/10',
  warning: 'text-yellow-500 bg-yellow-500/10',
  success: 'text-green-500 bg-green-500/10',
  error: 'text-red-500 bg-red-500/10',
};

const notificationTypeIcons = {
  info: 'ℹ️',
  warning: '⚠️',
  success: '✅',
  error: '❌',
};

export function NotificationPopup() {
  const { notifications, unreadCount, markAsRead } = useSystemNotifications();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [hasShownForSession, setHasShownForSession] = useState(false);

  useEffect(() => {
    // Mostrar popup apenas uma vez por sessão quando houver notificações não lidas
    if (user && unreadCount > 0 && !hasShownForSession) {
      setOpen(true);
      setHasShownForSession(true);
    }
  }, [user, unreadCount, hasShownForSession]);

  const handleMarkAllAsRead = () => {
    notifications
      .filter(n => !n.isRead)
      .forEach(n => markAsRead(n.id));
    setOpen(false);
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  if (unreadNotifications.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Você tem {unreadCount} notificação{unreadCount !== 1 ? 'ões' : ''} nova{unreadCount !== 1 ? 's' : ''}</span>
            <Badge variant="default">{unreadCount}</Badge>
          </DialogTitle>
          <DialogDescription>
            Confira as atualizações importantes do sistema
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-4">
            {unreadNotifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-xl flex-shrink-0",
                      notificationTypeColors[notification.type]
                    )}
                  >
                    {notificationTypeIcons[notification.type]}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-base">
                        {notification.title}
                      </h4>
                      <Badge variant="outline" className="capitalize">
                        {notification.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Fechar
          </Button>
          <Button onClick={handleMarkAllAsRead}>
            Marcar todas como lidas
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
