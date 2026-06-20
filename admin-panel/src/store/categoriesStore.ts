import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface AdminCategory {
  id: string;
  name: string;
  nameHi: string;
  nameGu: string;
  color: string;
  order: number;
}

interface CategoriesState {
  categories: AdminCategory[];
  loading: boolean;
  subscribeToCategories: () => void;
  addCategory: (name: string, color: string, nameHi?: string, nameGu?: string) => Promise<void>;
  updateCategory: (id: string, name: string, nameHi?: string, nameGu?: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  loading: false,

  subscribeToCategories: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    
    set({ loading: true });

    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();

      const cats: AdminCategory[] = data.map((d: any, index: number) => ({
        id: d.id,
        name: d.name,
        nameHi: d.nameHi || '',
        nameGu: d.nameGu || '',
        color: d.icon || '#D4AF37',
        order: index,
      }));

      set({ categories: cats, loading: false });
    } catch (error: any) {
      console.error('Fetch categories error:', error.message);
      set({ loading: false });
    }
  },

  addCategory: async (name, color, nameHi, nameGu) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, icon: color, nameHi, nameGu })
      });
      if (!response.ok) throw new Error('Failed to add category');
      
      // Refresh
      get().subscribeToCategories();
    } catch (e) {
      console.error('Failed to add category:', e);
    }
  },

  updateCategory: async (id, name, nameHi, nameGu) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, nameHi, nameGu })
      });
      if (!response.ok) throw new Error('Failed to update category');
      
      // Refresh
      get().subscribeToCategories();
    } catch (e) {
      console.error('Failed to update category:', e);
    }
  },

  deleteCategory: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to delete category');
      
      // Refresh
      get().subscribeToCategories();
    } catch (e) {
      console.error('Failed to delete category:', e);
    }
  },
}));
