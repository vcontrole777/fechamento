import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { addDays, startOfDay, endOfDay, format, differenceInDays, isPast, isToday } from "date-fns";

export interface UpcomingReminder {
  id: string;
  title: string;
  content: string;
  date: string;
  notify_days_before: number;
  created_at: string;
  urgency: 'today' | 'tomorrow' | 'soon' | 'upcoming';
  daysUntil: number;
}

export function useUpcomingReminders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["upcomingReminders", user?.id],
    queryFn: async (): Promise<UpcomingReminder[]> => {
      if (!user) return [];

      const today = startOfDay(new Date());
      const nextWeek = endOfDay(addDays(new Date(), 14));

      const { data, error } = await supabase
        .from("notes_and_reminders")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_reminder", true)
        .eq("completed", false)
        .eq("notify_enabled", true)
        .gte("date", format(today, "yyyy-MM-dd"))
        .lte("date", format(nextWeek, "yyyy-MM-dd"))
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching upcoming reminders:", error);
        return [];
      }

      // Calculate urgency and filter based on notification settings
      const reminders: UpcomingReminder[] = (data || [])
        .map(reminder => {
          const reminderDate = new Date(reminder.date);
          const daysUntil = differenceInDays(reminderDate, today);
          const shouldNotify = daysUntil <= (reminder.notify_days_before || 1);

          if (!shouldNotify) return null;

          let urgency: UpcomingReminder['urgency'] = 'upcoming';
          if (isToday(reminderDate)) {
            urgency = 'today';
          } else if (daysUntil === 1) {
            urgency = 'tomorrow';
          } else if (daysUntil <= 3) {
            urgency = 'soon';
          }

          return {
            id: reminder.id,
            title: reminder.title,
            content: reminder.content || "",
            date: reminder.date,
            notify_days_before: reminder.notify_days_before || 1,
            created_at: reminder.created_at,
            urgency,
            daysUntil,
          };
        })
        .filter((r): r is UpcomingReminder => r !== null);

      return reminders;
    },
    enabled: !!user,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });
}
