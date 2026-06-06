import { create } from 'zustand';
import { db } from '../utils/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: 'XRF Machines' | 'Laser Marking' | 'Micro Balances' | 'Fire Assay Equipment';
  price: number | null;
  yearOfPurchase: number;
  yearsUsed: number;
  condition: string;
  warranty: string;
  contactNumber: string;
  pricingType: 'fixed' | 'negotiable';
  brand: string;
  city: string;
  state: string;
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

let unsubscribe: (() => void) | null = null;

export const useListingsStore = create<ListingsState>((set) => ({
  listings: [],
  loading: true,
  subscribeToListings: () => {
    if (unsubscribe) return;
    set({ loading: true });

    // Listen to ALL listings (no filter) so admin sees every status
    unsubscribe = onSnapshot(collection(db, 'listings'), (snapshot) => {
      const listingsList: Listing[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        const createdDate = data.createdAt
          ? new Date(data.createdAt.seconds * 1000).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        // Map category — the mobile app stores exact category names like 'XRF Machines'
        const validCategories = ['XRF Machines', 'Laser Marking', 'Micro Balances', 'Fire Assay Equipment'];
        const category = validCategories.includes(data.category) 
          ? data.category as Listing['category']
          : 'XRF Machines';

        // Map mobile app status values to admin panel status values
        // Mobile app uses: 'active', 'pending', 'sold'
        // Admin panel uses: 'approved', 'pending', 'rejected', 'sold'
        const statusMap: Record<string, Listing['status']> = {
          'active': 'approved',
          'pending': 'pending',
          'sold': 'sold',
          'rejected': 'rejected',
          'approved': 'approved',
        };
        const status = statusMap[data.status] || 'pending';

        // Build a display title from brand + category since mobile app doesn't store a title
        const brand = data.brand || 'Unknown Brand';
        const title = data.title || `${brand} ${category}`;

        listingsList.push({
          id: d.id,
          title,
          description: data.description || '',
          category,
          price: data.price ?? null,
          yearOfPurchase: data.yearOfPurchase || new Date().getFullYear(),
          yearsUsed: data.yearsUsed || 0,
          condition: data.condition || 'Good',
          warranty: data.warranty || 'None',
          contactNumber: data.contactNumber || data.phone || '',
          pricingType: data.pricingType || 'negotiable',
          brand,
          city: data.city || '',
          state: data.state || '',
          sellerId: data.userId || data.sellerId || '',
          sellerName: data.sellerName || data.userName || '',
          // Mobile app stores Cloudinary URLs in "photos" field
          imageUrls: data.photos || data.imageUrls || data.images || [],
          createdDate,
          featured: data.featured ?? false,
          status,
        });
      });

      set({ listings: listingsList, loading: false });
    }, (error) => {
      console.error("Firestore listings connection error:", error.message);
      set({ listings: [], loading: false });
    });
  },
  addListing: (newListing) => set((state) => ({
    listings: [
      ...state.listings,
      {
        ...newListing,
        id: `LST-${200 + state.listings.length + 1}`,
        createdDate: new Date().toISOString().split('T')[0]
      }
    ]
  })),
  updateListing: (id, updates) => set((state) => ({
    listings: state.listings.map((l) => l.id === id ? { ...l, ...updates } : l)
  })),
  approveListing: async (id) => {
    try {
      const listingRef = doc(db, 'listings', id);
      // Write 'active' back to Firestore since that's what the mobile app expects
      await updateDoc(listingRef, { status: 'active' });
    } catch {
      set((state) => ({
        listings: state.listings.map((l) => l.id === id ? { ...l, status: 'approved' } : l)
      }));
    }
  },
  rejectListing: async (id) => {
    try {
      const listingRef = doc(db, 'listings', id);
      await updateDoc(listingRef, { status: 'rejected' });
    } catch {
      set((state) => ({
        listings: state.listings.map((l) => l.id === id ? { ...l, status: 'rejected' } : l)
      }));
    }
  },
  toggleFeatured: async (id) => {
    const store = useListingsStore.getState();
    const listing = store.listings.find((l) => l.id === id);
    if (!listing) return;
    const newFeatured = !listing.featured;
    try {
      const listingRef = doc(db, 'listings', id);
      await updateDoc(listingRef, { featured: newFeatured });
    } catch {
      set((state) => ({
        listings: state.listings.map((l) => l.id === id ? { ...l, featured: newFeatured } : l)
      }));
    }
  },
  deleteListing: async (id) => {
    try {
      await deleteDoc(doc(db, 'listings', id));
    } catch {
      set((state) => ({
        listings: state.listings.filter((l) => l.id !== id)
      }));
    }
  }
}));
