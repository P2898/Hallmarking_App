import { create } from 'zustand';
import { db } from '../utils/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNotificationsStore } from './notificationsStore';

export interface Report {
  id: string;
  listingId: string;
  reporterId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

interface ReportsState {
  reports: Report[];
  loading: boolean;
  subscribeToReports: () => void;
  updateReportStatus: (id: string, status: Report['status']) => Promise<void>;
  deleteReport: (id: string) => Promise<void>;
}

let unsubscribe: (() => void) | null = null;
const knownReportIds: Set<string> = new Set(
  JSON.parse(localStorage.getItem('mx_known_report_ids') || '[]')
);

export const useReportsStore = create<ReportsState>((set) => ({
  reports: [],
  loading: true,
  subscribeToReports: () => {
    if (unsubscribe) return;
    set({ loading: true });

    unsubscribe = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const reportsList: Report[] = [];
      const newReportNotifications: { reason: string; id: string }[] = [];

      snapshot.forEach((d) => {
        const data = d.data();
        const createdAt = data.createdAt
          ? new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        reportsList.push({
          id: d.id,
          listingId: data.listingId || '',
          reporterId: data.reporterId || '',
          reason: data.reason || 'Spam',
          status: data.status || 'pending',
          createdAt,
        });

        // Check if this is a new report
        if (!knownReportIds.has(d.id)) {
          knownReportIds.add(d.id);
          newReportNotifications.push({
            reason: data.reason || 'Spam',
            id: d.id,
          });
        }
      });

      // Persist known IDs
      localStorage.setItem('mx_known_report_ids', JSON.stringify([...knownReportIds]));

      // Fire notifications
      if (newReportNotifications.length > 0) {
        const { addNotification } = useNotificationsStore.getState();
        newReportNotifications.forEach((nr) => {
          addNotification({
            type: 'system',
            title: 'New Listing Report',
            description: `A listing was reported for: ${nr.reason}`,
            read: false,
            link: '/reports',
          });
        });
      }

      set({ reports: reportsList, loading: false });
    }, (error) => {
      console.error("Firestore reports connection error:", error.message);
      set({ reports: [], loading: false });
    });
  },
  updateReportStatus: async (id, status) => {
    try {
      await updateDoc(doc(db, 'reports', id), { status });
    } catch (error) {
      console.error("Error updating report:", error);
      set((state) => ({
        reports: state.reports.map((r) => r.id === id ? { ...r, status } : r)
      }));
    }
  },
  deleteReport: async (id) => {
    try {
      await deleteDoc(doc(db, 'reports', id));
    } catch (error) {
      console.error("Error deleting report:", error);
      set((state) => ({
        reports: state.reports.filter((r) => r.id !== id)
      }));
    }
  }
}));
