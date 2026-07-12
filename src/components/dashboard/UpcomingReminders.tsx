import { Bell, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUpcomingReminders } from "@/hooks/useUpcomingReminders";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

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

export function UpcomingReminders({ className }: { className?: string }) {
  const { data: reminders, isLoading } = useUpcomingReminders();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Próximos Lembretes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!reminders || reminders.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Próximos Lembretes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Nenhum lembrete próximo
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Seus lembretes aparecerão aqui
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5" />
            Próximos Lembretes
          </CardTitle>
          {reminders.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {reminders.length}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {reminders.slice(0, 5).map((reminder) => (
          <div
            key={reminder.id}
            className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
          >
            <div className="mt-0.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1 space-y-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-tight line-clamp-2">
                  {reminder.title}
                </p>
                <Badge 
                  variant={urgencyColors[reminder.urgency]}
                  className="shrink-0 text-xs"
                >
                  {urgencyLabels[reminder.urgency]}
                </Badge>
              </div>
              {reminder.content && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {reminder.content}
                </p>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {format(new Date(reminder.date), "dd 'de' MMM", { locale: ptBR })}
                {reminder.daysUntil > 0 && (
                  <span className="ml-1">
                    ({reminder.daysUntil} {reminder.daysUntil === 1 ? 'dia' : 'dias'})
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        {reminders.length > 5 && (
          <p className="text-xs text-center text-muted-foreground pt-2">
            + {reminders.length - 5} lembrete{reminders.length - 5 > 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
