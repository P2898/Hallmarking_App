import { create } from 'zustand';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export interface AppCategory {
  id: string;
  name: string;
  nameHi?: string | null;
  nameGu?: string | null;
  color: string;
  order: number;
  icon?: string | null;
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
    let active = true;
    set({ loading: true });

    const fetchCats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categories`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        
        if (active) {
          const cats: AppCategory[] = data.map((d: any, index: number) => ({
            id: d.id,
            name: d.name,
            nameHi: d.nameHi || null,
            nameGu: d.nameGu || null,
            color: '#D4AF37', // Default gold color
            order: index + 1,
            icon: d.icon,
          }));

          cats.push({
            id: 'other',
            name: 'Other',
            nameHi: 'अन्य',
            nameGu: 'અન્ય',
            color: '#D4AF37',
            order: cats.length + 1,
          });

          set({ categories: cats, loading: false });
        }
      } catch (error: any) {
        console.error('[Categories] API error:', error.message);
        if (active) {
          set({ loading: false });
        }
      }
    };

    fetchCats();

    // Return unsubscribe/cleanup function
    return () => {
      active = false;
    };
  },
}));
