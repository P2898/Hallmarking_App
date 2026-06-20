import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

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


export const useReportsStore = create<ReportsState>((set, get) => ({
  reports: [],
  loading: false,
  subscribeToReports: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ loading: true });

    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch reports');
      const data = await response.json();

      const reportsList: Report[] = [];
      data.forEach((d: any) => {
        const createdAt = d.createdAt
          ? new Date(d.createdAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        reportsList.push({
          id: d.id,
          listingId: d.listingId || '',
          reporterId: d.reporterId || '',
          reason: d.reason || 'Spam',
          status: d.status || 'pending',
          createdAt,
        });
      });

      set({ reports: reportsList, loading: false });
    } catch (error: any) {
      console.error("Fetch reports error:", error.message);
      set({ reports: [], loading: false });
    }
  },
  updateReportStatus: async (id, status) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      await fetch(`${API_URL}/api/reports/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      get().subscribeToReports();
    } catch (error) {
      console.error("Error updating report:", error);
    }
  },
  deleteReport: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      await fetch(`${API_URL}/api/reports/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      get().subscribeToReports();
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  }
}));
