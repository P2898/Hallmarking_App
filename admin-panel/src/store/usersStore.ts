import { create } from 'zustand';
import { db } from '../utils/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

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

let unsubscribe: (() => void) | null = null;

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  loading: true,
  subscribeToUsers: () => {
    if (unsubscribe) return;
    set({ loading: true });
    
    unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList: User[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        const name = data.fullName || data.name || 'Unnamed';
        const joinedDate = data.createdAt
          ? new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        // Auto-approve any pending users so they can access the app immediately
        if (data.status === 'pending') {
          updateDoc(doc(db, 'users', d.id), { status: 'active' }).catch(console.error);
        }

        usersList.push({
          id: d.id,
          name,
          email: data.email || '',
          phone: data.phone || data.contactNumber || '',
          role: data.role || 'jeweller',
          status: data.status === 'pending' ? 'active' : (data.status || 'active'),
          city: data.city || '',
          state: data.state || '',
          companyName: data.companyName || data.businessName || '',
          joinedDate,
          profileImage: data.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        });
      });

      set({ users: usersList, loading: false });
    }, (error) => {
      console.error("Firestore users connection error:", error.message);
      set({ users: [], loading: false });
    });
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
    try {
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, { status });
      set((state) => ({
        users: state.users.map((u) => u.id === id ? { ...u, status } : u)
      }));
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  },
  deleteUser: async (id) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      set((state) => ({
        users: state.users.filter((u) => u.id !== id)
      }));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }
}));
