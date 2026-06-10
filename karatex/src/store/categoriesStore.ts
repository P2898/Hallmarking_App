import { create } from 'zustand';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase.config';

export interface AppCategory {
  id: string;
  name: string;
  color: string;
  order: number;
}

interface CategoriesStore {
  categories: AppCategory[];
  loading: boolean;
  subscribeToCategories: () => () => void;
}

export const useCategoriesStore = create<CategoriesStore>((set) => ({
  categories: [],
  loading: true,

  subscribeToCategories: () => {
    const unsubscribe = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const cats: AppCategory[] = snapshot.docs.map(d => ({
          id: d.id,
          name: d.data().name as string,
          color: (d.data().color as string) || '#D4AF37',
          order: (d.data().order as number) ?? 99,
        })).sort((a, b) => a.order - b.order);

        set({ categories: cats, loading: false });
      },
      (error) => {
        console.error('[Categories] Firestore error:', error.message);
        set({ loading: false });
      }
    );
    return unsubscribe;
  },
}));
