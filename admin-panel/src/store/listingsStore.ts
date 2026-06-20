import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number | null;
  yearOfPurchase: number;
  yearsUsed: number;
  condition: string;
  warranty: string;
  contactNumber: string;
  pricingType: 'fixed' | 'negotiable';
  brand: string;
  model?: string;
  city: string;
  state: string;
  country?: string;
  sellerId: string;
  sellerName: string;
  status: 'approved' | 'pending' | 'rejected' | 'sold';
  imageUrls: string[];
  createdDate: string;
  featured?: boolean;
}

interface ListingsState {
  listings: Listing[];
  loading: boolean;
  subscribeToListings: () => void;
  addListing: (listing: Omit<Listing, 'id' | 'createdDate'>) => void;
  updateListing: (id: string, updates: Partial<Listing>) => void;
  approveListing: (id: string) => Promise<void>;
  rejectListing: (id: string) => Promise<void>;
  toggleFeatured: (id: string) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
}

export const useListingsStore = create<ListingsState>((set) => ({
  listings: [],
  loading: false,
  subscribeToListings: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    
    set({ loading: true });

    try {
      // Fetch all listings regardless of status since we are admin
      const response = await fetch(`${API_URL}/api/listings?status=all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch listings');
      const data = await response.json();

      const listingsList: Listing[] = data.map((d: any) => {
        const createdDate = d.createdAt
          ? new Date(d.createdAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        const statusMap: Record<string, Listing['status']> = {
          'active': 'approved',
          'pending': 'pending',
          'sold': 'sold',
          'rejected': 'rejected',
          'approved': 'approved',
        };
        const status = statusMap[d.status] || 'pending';

        return {
          id: d.id,
          title: d.title || 'Untitled',
          description: d.description || '',
          category: d.category?.name || 'Uncategorized',
          price: d.price || 0,
          yearOfPurchase: d.yearOfPurchase || d.year || new Date().getFullYear(),
          yearsUsed: d.yearsUsed || 0,
          condition: d.condition || 'Not specified',
          warranty: d.warranty || 'None',
          contactNumber: d.seller?.phoneNumber || '',
          pricingType: d.pricingType || 'fixed',
          brand: d.brand || d.title?.split(' ')[0] || '',
          model: d.model || '',
          city: d.city || '',
          state: d.state || '',
          country: d.country || '',
          sellerId: d.sellerId || '',
          sellerName: d.seller?.displayName || 'Unknown User',
          status,
          imageUrls: d.images || [],
          createdDate,
          featured: false
        };
      });

      set({ listings: listingsList, loading: false });
    } catch (error: any) {
      console.error("Fetch listings error:", error.message);
      set({ listings: [], loading: false });
    }
  },
  addListing: (listing) => set((state) => ({
    listings: [
      {
        ...listing,
        id: `LST-${Date.now()}`,
        createdDate: new Date().toISOString().split('T')[0]
      },
      ...state.listings
    ]
  })),
  updateListing: (id, updates) => set((state) => ({
    listings: state.listings.map((l) => l.id === id ? { ...l, ...updates } : l)
  })),
  approveListing: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/listings/${id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'active' }) // 'active' maps to 'approved'
      });
      set((state) => ({
        listings: state.listings.map((l) => l.id === id ? { ...l, status: 'approved' } : l)
      }));
    } catch (err) {
      console.error(err);
    }
  },
  rejectListing: async (id) => {
    // Implement reject status if backend supports it, else just local map
    set((state) => ({
      listings: state.listings.map((l) => l.id === id ? { ...l, status: 'rejected' } : l)
    }));
  },
  toggleFeatured: async (id) => {
    set((state) => ({
      listings: state.listings.map((l) => l.id === id ? { ...l, featured: !l.featured } : l)
    }));
  },
  deleteListing: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) return;
    try {
      await fetch(`${API_URL}/api/listings/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      set((state) => ({
        listings: state.listings.filter((l) => l.id !== id)
      }));
    } catch (err) {
      console.error(err);
    }
  }
}));
