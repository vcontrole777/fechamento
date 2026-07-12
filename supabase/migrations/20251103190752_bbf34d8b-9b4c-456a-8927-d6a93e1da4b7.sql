-- Add notification fields to notes_and_reminders table
ALTER TABLE public.notes_and_reminders 
ADD COLUMN IF NOT EXISTS notify_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notify_days_before integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS last_notification_sent timestamp with time zone;

-- Add index for efficient querying of upcoming reminders
CREATE INDEX IF NOT EXISTS idx_notes_reminders_notify 
ON public.notes_and_reminders(date, notify_enabled) 
WHERE is_reminder = true AND completed = false AND notify_enabled = true;