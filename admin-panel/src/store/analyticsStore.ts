import { create } from 'zustand';
import { useUsersStore } from './usersStore';
import { useListingsStore } from './listingsStore';
import { useChatsStore } from './chatsStore';

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

interface AnalyticsState {
  loading: boolean;
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
  getCategoryDistribution: () => CategoryData[];
  getStateDistribution: () => StateDistribution[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'XRF Machines': '#D4AF37',
  'Laser Marking': '#1A1A1A',
  'Micro Balances': '#4B5563',
  'Fire Assay Equipment': '#9CA3AF',
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  loading: false,
  refreshStats: () => {
    set({ loading: true });
    // Trigger re-render; actual data is derived from live stores
    setTimeout(() => set({ loading: false }), 300);
  },

  // Derive summary stats from live Firestore data
  getSummaryStats: () => {
    const users = useUsersStore.getState().users;
    const listings = useListingsStore.getState().listings;
    const chats = useChatsStore.getState().chats;

    const totalUsers = users.length;
    const activeListings = listings.filter(l => l.status === 'approved').length;
    const totalChats = chats.length;

    const pendingListings = listings.filter(l => l.status === 'pending').length;
    const estimatedGmv = listings
      .filter(l => l.status === 'approved' || l.status === 'sold')
      .reduce((sum, l) => sum + (l.price || 0), 0);

    return { totalUsers, activeListings, totalChats, pendingListings, estimatedGmv };
  },

  // Derive monthly registration data from real user joinedDate
  getMonthlyRegs: () => {
    const users = useUsersStore.getState().users;
    const currentYear = new Date().getFullYear();
    const monthlyMap: Record<string, { jewellers: number; centres: number; refiners: number }> = {};

    MONTH_NAMES.forEach(m => { monthlyMap[m] = { jewellers: 0, centres: 0, refiners: 0 }; });

    users.forEach(u => {
      const date = new Date(u.joinedDate);
      if (date.getFullYear() === currentYear) {
        const month = MONTH_NAMES[date.getMonth()];
        if (u.role === 'jeweller') monthlyMap[month].jewellers++;
        else if (u.role === 'hallmarking_centre') monthlyMap[month].centres++;
        else if (u.role === 'refiner') monthlyMap[month].refiners++;
      }
    });

    // Return only months up to current month
    const currentMonth = new Date().getMonth();
    return MONTH_NAMES.slice(0, currentMonth + 1).map(month => ({
      month,
      ...monthlyMap[month]
    }));
  },

  // Derive monthly listing data from real createdDate
  getMonthlyListings: () => {
    const listings = useListingsStore.getState().listings;
    const currentYear = new Date().getFullYear();
    const monthlyMap: Record<string, { created: number; sold: number }> = {};

    MONTH_NAMES.forEach(m => { monthlyMap[m] = { created: 0, sold: 0 }; });

    listings.forEach(l => {
      const date = new Date(l.createdDate);
      if (date.getFullYear() === currentYear) {
        const month = MONTH_NAMES[date.getMonth()];
        monthlyMap[month].created++;
        if (l.status === 'sold') monthlyMap[month].sold++;
      }
    });

    const currentMonth = new Date().getMonth();
    return MONTH_NAMES.slice(0, currentMonth + 1).map(month => ({
      month,
      ...monthlyMap[month]
    }));
  },

  // Derive category distribution from real listings
  getCategoryDistribution: () => {
    const listings = useListingsStore.getState().listings;
    const catMap: Record<string, number> = {};

    listings.forEach(l => {
      catMap[l.category] = (catMap[l.category] || 0) + 1;
    });

    return Object.entries(catMap).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || '#6B7280'
    }));
  },

  // Derive state distribution from real users and listings
  getStateDistribution: () => {
    const users = useUsersStore.getState().users;
    const listings = useListingsStore.getState().listings;

    const stateMap: Record<string, { users: number; listings: number }> = {};

    users.forEach(u => {
      if (u.state) {
        if (!stateMap[u.state]) stateMap[u.state] = { users: 0, listings: 0 };
        stateMap[u.state].users++;
      }
    });

    listings.forEach(l => {
      if (l.state) {
        if (!stateMap[l.state]) stateMap[l.state] = { users: 0, listings: 0 };
        stateMap[l.state].listings++;
      }
    });

    return Object.entries(stateMap)
      .map(([state, data]) => ({ state, ...data }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 8); // Top 8 states
  }
}));
