import { create } from 'zustand';
import { db } from '../utils/firebase';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

export interface AdminCategory {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface CategoriesState {
  categories: AdminCategory[];
  loading: boolean;
  subscribeToCategories: () => void;
  addCategory: (name: string, color: string) => Promise<void>;
  updateCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  seedDefaultCategories: () => Promise<void>;
}

const DEFAULT_CATEGORIES = [
  { name: 'XRF Machines', color: '#D4AF37', order: 0 },
  { name: 'Laser Marking', color: '#1A1A1A', order: 1 },
  { name: 'Micro Balances', color: '#4B5563', order: 2 },
  { name: 'Fire Assay Equipment', color: '#9CA3AF', order: 3 },
];

let unsubscribe: (() => void) | null = null;

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  categories: [],
  loading: true,

  subscribeToCategories: () => {
    if (unsubscribe) return;
    set({ loading: true });

    unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      if (snapshot.empty) {
        // No categories in DB yet — seed defaults
        get().seedDefaultCategories();
        return;
      }
      const cats: AdminCategory[] = snapshot.docs.map(d => ({
        id: d.id,
        name: d.data().name,
        color: d.data().color || '#D4AF37',
        order: d.data().order ?? 99,
      })).sort((a, b) => a.order - b.order);

      set({ categories: cats, loading: false });
    }, (error) => {
      console.error('Firestore categories error:', error.message);
      set({ loading: false });
    });
  },

  seedDefaultCategories: async () => {
    try {
      for (const cat of DEFAULT_CATEGORIES) {
        await addDoc(collection(db, 'categories'), cat);
      }
    } catch (e) {
      console.error('Failed to seed default categories:', e);
    }
  },

  addCategory: async (name, color) => {
    const { categories } = get();
    await addDoc(collection(db, 'categories'), {
      name,
      color,
      order: categories.length,
    });
  },

  updateCategory: async (id, name) => {
    await updateDoc(doc(db, 'categories', id), { name });
  },

  deleteCategory: async (id) => {
    await deleteDoc(doc(db, 'categories', id));
  },
}));
