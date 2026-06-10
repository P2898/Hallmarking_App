import { create } from 'zustand';

interface AppUser {
  id: string;
  fullName: string;
  companyName: string;
  email: string;
  city: string;
  state: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface AppState {
  hasSeenSplash: boolean;
  setHasSeenSplash: (val: boolean) => void;
  isAuthenticated: boolean;
  user: AppUser | null;
  language: 'EN' | 'HI' | 'GU';
  login: (email: string) => void;
  register: (data: any) => void;
  logout: () => void;
  setLanguage: (lang: 'EN' | 'HI' | 'GU') => void;
  simulateApproval: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  hasSeenSplash: false,
  setHasSeenSplash: (val) => set({ hasSeenSplash: val }),
  isAuthenticated: false,
  user: null,
  language: 'EN',
  
  login: (email) => set({ 
    isAuthenticated: true, 
    user: {
      id: '1',
      fullName: 'Mock User',
      companyName: 'HallmarkHub Jewelry',
      email,
      city: 'Mumbai',
      state: 'Maharashtra',
      status: 'approved'
    }
  }),
  
  register: (data) => set({ 
    isAuthenticated: true, 
    user: {
      id: '1',
      fullName: data.personName || 'New User',
      companyName: data.companyName || 'New Company',
      email: data.email,
      city: data.city || 'City',
      state: data.state || 'State',
      status: 'pending' // New users start as pending
    }
  }),
  
  logout: () => set({ isAuthenticated: false, user: null }),
  
  setLanguage: (lang) => set({ language: lang }),
  
  simulateApproval: () => set((state) => ({
    user: state.user ? { ...state.user, status: 'approved' } : null
  }))
}));
