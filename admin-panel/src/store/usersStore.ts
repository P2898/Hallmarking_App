import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface User {
  id: string;
  name: string;
  companyName: string;
  role: 'jeweller' | 'hallmarking_centre' | 'refiner' | 'admin';
  phone: string;
  email: string;
  city: string;
  state: string;
  status: 'active' | 'pending' | 'suspended';
  joinedDate: string;
  profileImage: string;
}

interface UsersState {
  users: User[];
  loading: boolean;
  subscribeToUsers: () => void;
  addUser: (user: Omit<User, 'id' | 'joinedDate'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  updateUserStatus: (id: string, status: User['status']) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: [],
  loading: false,
  subscribeToUsers: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    
    set({ loading: true });
    
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      
      const usersList: User[] = data.map((d: any) => {
        const name = d.displayName || d.name || 'Unnamed';
        return {
          id: d.id,
          name,
          email: d.email || '',
          phone: d.phoneNumber || '',
          role: d.userType || d.role || 'user',
          status: 'active', // our backend users don't have status yet, assume active
          city: d.city || '',
          state: d.state || '',
          companyName: d.companyName || '',
          joinedDate: d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          profileImage: d.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        };
      });

      set({ users: usersList, loading: false });
    } catch (error: any) {
      console.error("Fetch users connection error:", error.message);
      set({ users: [], loading: false });
    }
  },
  addUser: (newUser) => set((state) => ({
    users: [
      ...state.users,
      {
        ...newUser,
        id: `USR-${100 + state.users.length + 1}`,
        joinedDate: new Date().toISOString().split('T')[0],
      }
    ]
  })),
  updateUser: (id, updates) => set((state) => ({
    users: state.users.map((u) => u.id === id ? { ...u, ...updates } : u)
  })),
  updateUserStatus: async (id, status) => {
    // MySQL users don't have a status column yet, but we can update local state
    set((state) => ({
      users: state.users.map((u) => u.id === id ? { ...u, status } : u)
    }));
  },
  deleteUser: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete user');
      
      set((state) => ({
        users: state.users.filter((u) => u.id !== id)
      }));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }
}));
