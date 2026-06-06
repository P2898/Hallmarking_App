import { create } from 'zustand';

export interface AdminNotification {
  id: string;
  type: 'listing_pending' | 'chat_flagged' | 'system_alert';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  link?: string;
}

interface NotificationsState {
  notifications: AdminNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [

    {
      id: 'NOT-2',
      type: 'listing_pending',
      title: 'Listing Approval Required',
      description: 'A new listing for "XRF Machine" requires approval.',
      timestamp: '5 mins ago',
      read: false,
      link: '/listings'
    }
  ],
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
  })),
  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true }))
  }))
}));
