import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface MonthlyRegData {
  month: string;
  jewellers: number;
  centres: number;
  refiners: number;
}

export interface MonthlyListingData {
  month: string;
  created: number;
  sold: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface StateDistribution {
  state: string;
  users: number;
  listings: number;
}

export interface StateDistributionData {
  state: string;
  users: number;
  listings: number;
}

export interface CategoryDistributionData {
  name: string;
  value: number;
  color: string;
}

interface AnalyticsState {
  loading: boolean;
  totalUsers: number;
  activeListings: number;
  totalChats: number;
  pendingListings: number;
  estimatedGmv: number;
  monthlyRegs: MonthlyRegData[];
  monthlyListings: MonthlyListingData[];
  stateDistribution: StateDistributionData[];
  categoryDistribution: CategoryDistributionData[];
  refreshStats: () => void;
  getSummaryStats: () => {
    totalUsers: number;
    activeListings: number;
    totalChats: number;
    pendingListings: number;
    estimatedGmv: number;
  };
  getMonthlyRegs: () => MonthlyRegData[];
  getMonthlyListings: () => MonthlyListingData[];
  getCategoryDistribution: () => CategoryDistributionData[];
  getStateDistribution: () => StateDistributionData[];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  loading: false,
  totalUsers: 0,
  activeListings: 0,
  totalChats: 0,
  pendingListings: 0,
  estimatedGmv: 0,
  monthlyRegs: [],
  monthlyListings: [],
  stateDistribution: [],
  categoryDistribution: [],

  refreshStats: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ loading: true });

    try {
      const response = await fetch(`${API_URL}/api/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();

      set({
        totalUsers: data.totalUsers,
        activeListings: data.activeListings,
        totalChats: data.totalChats,
        pendingListings: data.pendingReports, // We don't have pending listings right now, mock using reports
        estimatedGmv: data.totalTransactionVolume,
        monthlyRegs: data.monthlyRegs || [],
        monthlyListings: data.monthlyListings || [],
        stateDistribution: data.stateDistribution || [],
        categoryDistribution: data.categoryDistribution || [],
        loading: false
      });
    } catch (error) {
      console.error('Fetch analytics error:', error);
      set({ loading: false });
    }
  },

  getSummaryStats: () => {
    const { totalUsers, activeListings, totalChats, pendingListings, estimatedGmv } = get();
    return { totalUsers, activeListings, totalChats, pendingListings, estimatedGmv };
  },

  // The below functions return the live grouped data returned from the backend.
  getMonthlyRegs: () => {
    const { monthlyRegs } = get();
    // Return empty fallback array if not yet fetched
    return monthlyRegs.length > 0 ? monthlyRegs : MONTH_NAMES.map(month => ({
      month,
      jewellers: 0,
      centres: 0,
      refiners: 0,
    }));
  },

  getMonthlyListings: () => {
    const { monthlyListings } = get();
    return monthlyListings.length > 0 ? monthlyListings : MONTH_NAMES.map(month => ({
      month,
      created: 0,
      sold: 0,
    }));
  },

  getCategoryDistribution: () => {
    return get().categoryDistribution;
  },

  getStateDistribution: () => {
    return get().stateDistribution;
  },
}));
