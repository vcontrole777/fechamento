import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: number;
  start_date: string;
  end_date: string | null;
  active: boolean;
  created_at: string;
  isRead?: boolean;
}

export function useSystemNotifications() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      // Buscar notificações ativas
      const { data: notifs, error: notifsError } = await supabase
        .from('system_notifications')
        .select('*')
        .eq('active', true)
        .lte('start_date', new Date().toISOString())
        .or(`end_date.is.null,end_date.gte.${new Date().toISOString()}`)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (notifsError) throw notifsError;

      // Buscar notificações lidas pelo usuário
      const { data: reads, error: readsError } = await supabase
        .from('user_notification_reads')
        .select('notification_id')
        .eq('user_id', user.id);

      if (readsError) throw readsError;

      const readIds = new Set(reads?.map(r => r.notification_id) || []);

      const enrichedNotifs = (notifs || []).map(notif => ({
        ...notif,
        type: notif.type as 'info' | 'warning' | 'success' | 'error',
        isRead: readIds.has(notif.id)
      }));

      setNotifications(enrichedNotifs);
      setUnreadCount(enrichedNotifs.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_notification_reads')
        .insert({
          user_id: user.id,
          notification_id: notificationId
        });

      if (error && error.code !== '23505') { // Ignorar erro de duplicata
        throw error;
      }

      // Atualizar estado local
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);

    // Escutar mudanças em tempo real
    const channel = supabase
      .channel('system_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'system_notifications'
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    refresh: fetchNotifications
  };
}
