import { create } from 'zustand';

export interface AdminNotification {
  id: string;
  type: 'listing_pending' | 'chat_flagged' | 'system_alert' | 'new_listing';
  title: string;
  description: string;
  read: boolean;
  link?: string;
}

interface NotificationsState {
  notifications: AdminNotification[];
  addNotification: (notif: Omit<AdminNotification, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

// Load persisted notifications from localStorage
const loadNotifications = (): AdminNotification[] => {
  try {
    const stored = localStorage.getItem('mx_admin_notifications');
    if (stored) {
      const parsed: AdminNotification[] = JSON.parse(stored);
      // Clean up old notifications to match the new format
      const cleaned = parsed.map(n => {
        if (n.type === 'new_listing' && n.description.includes('was listed by')) {
          n.description = n.description.replace(/ was listed by .*\./, ' was listed.');
        }
        return n;
      });
      // Save cleaned versions back to storage
      localStorage.setItem('mx_admin_notifications', JSON.stringify(cleaned));
      return cleaned;
    }
  } catch (e) {
    console.error('Failed to load notifications:', e);
  }
  return [];
};

const saveNotifications = (notifications: AdminNotification[]) => {
  localStorage.setItem('mx_admin_notifications', JSON.stringify(notifications));
};

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: loadNotifications(),
  addNotification: (notif) => set((state) => {
    const newNotif: AdminNotification = {
      ...notif,
      id: `NOT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    const updated = [newNotif, ...state.notifications];
    saveNotifications(updated);
    return { notifications: updated };
  }),
  markNotificationRead: (id) => set((state) => {
    const updated = state.notifications.map((n) => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
    return { notifications: updated };
  }),
  markAllNotificationsRead: () => set((state) => {
    const updated = state.notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
    return { notifications: updated };
  })
}));
