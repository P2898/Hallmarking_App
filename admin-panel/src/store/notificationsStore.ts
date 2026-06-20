import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface AdminNotification {
  id: string;
  type: 'new_listing' | 'new_report' | 'listing_pending' | 'system_alert';
  title: string;
  description: string;
  read: boolean;
  link?: string;
  createdAt: string; // ISO timestamp for sorting
}

interface NotificationsState {
  notifications: AdminNotification[];
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
}

// Persist read state only in localStorage (not content — that comes from backend)
const loadReadIds = (): Set<string> => {
  try {
    const stored = localStorage.getItem('mx_admin_read_notif_ids');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
};

const saveReadIds = (ids: Set<string>) => {
  localStorage.setItem('mx_admin_read_notif_ids', JSON.stringify([...ids]));
};

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  loading: false,

  fetchNotifications: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ loading: true });

    try {
      const readIds = loadReadIds();
      const headers = { 'Authorization': `Bearer ${token}` };

      // Fetch both reports and listings in parallel
      const [reportsRes, listingsRes] = await Promise.all([
        fetch(`${API_URL}/api/reports`, { headers }),
        fetch(`${API_URL}/api/listings?status=all`, { headers }),
      ]);

      const notifications: AdminNotification[] = [];

      // --- Report notifications ---
      if (reportsRes.ok) {
        const reports = await reportsRes.json();
        reports.forEach((r: any) => {
          const notifId = `report-${r.id}`;
          notifications.push({
            id: notifId,
            type: 'new_report',
            title: 'New Listing Report',
            description: `A listing was reported for: ${r.reason || 'Policy violation'}`,
            read: readIds.has(notifId),
            link: '/reports',
            createdAt: r.createdAt || new Date().toISOString(),
          });
        });
      }

      // --- New listing notifications ---
      if (listingsRes.ok) {
        const listings = await listingsRes.json();
        listings.forEach((l: any) => {
          const notifId = `listing-${l.id}`;
          const catName = typeof l.category === 'object' ? l.category?.name : l.category;
          notifications.push({
            id: notifId,
            type: 'new_listing',
            title: 'New Listing Posted',
            description: `"${l.title || 'Untitled'}" was listed${catName ? ` under ${catName}` : ''}`,
            read: readIds.has(notifId),
            link: '/listings',
            createdAt: l.createdAt || new Date().toISOString(),
          });
        });
      }

      // Sort newest first
      notifications.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      set({ notifications, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch admin notifications:', error.message);
      set({ loading: false });
    }
  },

  markNotificationRead: (id) => {
    const readIds = loadReadIds();
    readIds.add(id);
    saveReadIds(readIds);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllNotificationsRead: () => {
    const { notifications } = get();
    const readIds = loadReadIds();
    notifications.forEach((n) => readIds.add(n.id));
    saveReadIds(readIds);
    set({ notifications: notifications.map((n) => ({ ...n, read: true })) });
  },
}));
