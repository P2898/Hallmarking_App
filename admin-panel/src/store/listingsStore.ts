import { create } from 'zustand';
import { db } from '../utils/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useNotificationsStore } from './notificationsStore';
import { useUsersStore } from './usersStore';

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
// Track listing IDs we've already seen so we only notify on truly new ones
const knownListingIds: Set<string> = new Set(
  JSON.parse(localStorage.getItem('mx_known_listing_ids') || '[]')
);

export const useListingsStore = create<ListingsState>((set) => ({
  listings: [],
  loading: true,
  subscribeToListings: () => {
    if (unsubscribe) return;
    set({ loading: true });

    // Listen to ALL listings (no filter) so admin sees every status
    unsubscribe = onSnapshot(collection(db, 'listings'), (snapshot) => {
      const listingsList: Listing[] = [];
      const newListingNotifications: { title: string; seller: string; id: string }[] = [];

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

        const sellerId = data.userId || data.sellerId || '';
        const users = useUsersStore.getState().users;
        const user = users.find(u => u.id === sellerId);
        let resolvedSellerName = data.sellerName || data.userName;
        if (!resolvedSellerName || resolvedSellerName === 'Unknown') {
          resolvedSellerName = user?.name || 'Unknown User';
        }

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
          sellerId,
          sellerName: resolvedSellerName,
          // Mobile app stores Cloudinary URLs in "photos" field
          imageUrls: data.photos || data.imageUrls || data.images || [],
          createdDate,
          featured: data.featured ?? false,
          status,
        });

        // Check if this is a new listing we haven't seen before
        if (!knownListingIds.has(d.id)) {
          knownListingIds.add(d.id);
          newListingNotifications.push({
            title,
            seller: resolvedSellerName,
            id: d.id,
          });
        }
      });

      // Persist known IDs
      localStorage.setItem('mx_known_listing_ids', JSON.stringify([...knownListingIds]));

      // Fire notifications for new listings
      if (newListingNotifications.length > 0) {
        const { addNotification } = useNotificationsStore.getState();
        newListingNotifications.forEach((nl) => {
          addNotification({
            type: 'new_listing',
            title: 'New Listing Added',
            description: `"${nl.title}" was listed.`,
            read: false,
            link: '/listings',
          });
        });
      }

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
