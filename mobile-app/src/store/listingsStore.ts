import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

interface Listing {
  id: string;
  sellerId: string;
  categoryId: string;
  buyerId?: string | null;
  title: string;
  description: string;
  price: number;
  images: string[]; // URLs of images
  status: 'active' | 'sold';
  condition: string;
  location: string;
  createdAt: string;
  seller?: {
    id: string;
    displayName: string | null;
    photoURL: string | null;
    phoneNumber: string | null;
  };
  category?: {
    id: string;
    name: string;
  };
}

interface ListingsStore {
  activeListings: Listing[];
  myListings: Listing[];
  buyHistory: Listing[];
  loadingActive: boolean;
  loadingMy: boolean;
  loadingBuyHistory: boolean;
  error: string | null;
  fetchActiveListings: () => () => void;
  fetchMyListings: () => () => void;
  fetchBuyHistory: () => () => void;
  createListing: (data: any, photoUris: string[], videoUri?: string | null) => Promise<void>;
  updateListingStatus: (id: string, status: 'sold' | 'active', buyerId?: string) => Promise<void>;
  updateListing: (id: string, data: any, photoUris: string[]) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
  reportListing: (listingId: string, reason: string) => Promise<void>;
}

// Helper function to upload image to our backend
const uploadImageToBackend = async (uri: string, token: string | null): Promise<string> => {
  console.log('[Backend Upload] Uploading image:', uri);
  
  const formData = new FormData();
  // For Expo/React Native, we format the file object in FormData like this
  const name = uri.split('/').pop() || 'upload.jpg';
  const match = /\.(\w+)$/.exec(name);
  const type = match ? `image/${match[1]}` : `image/jpeg`;
  
  formData.append('image', {
    uri,
    name,
    type,
  } as any);

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[Backend Upload] Image upload failed:', response.status, errText);
    throw new Error('Image upload failed');
  }

  const result = await response.json();
  console.log('[Backend Upload] Upload successful, relative path:', result.url);
  // Return the full URL or let the component handle it. Let's return the full URL to make it easy to render.
  return `${API_URL}${result.url}`;
};

export const useListingsStore = create<ListingsStore>((set, get) => ({
  activeListings: [],
  myListings: [],
  buyHistory: [],
  loadingActive: false,
  loadingMy: false,
  loadingBuyHistory: false,
  error: null,

  fetchActiveListings: () => {
    let active = true;
    set({ loadingActive: true, error: null });

    const fetchListings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/listings?status=active`);
        if (!response.ok) throw new Error('Failed to fetch active listings');
        const data = await response.json();
        
        if (active) {
          set({ activeListings: data, loadingActive: false });
        }
      } catch (error: any) {
        console.error('[Listings] fetchActiveListings error:', error.message);
        if (active) {
          set({ error: error.message, loadingActive: false });
        }
      }
    };

    fetchListings();

    return () => {
      active = false;
    };
  },

  fetchMyListings: () => {
    let active = true;
    const token = useAuthStore.getState().token;
    const user = useAuthStore.getState().user;
    if (!token || !user) return () => {};

    set({ loadingMy: true, error: null });

    const fetchMy = async () => {
      try {
        const response = await fetch(`${API_URL}/api/listings?sellerId=${user.id}&status=all`);
        if (!response.ok) throw new Error('Failed to fetch my listings');
        const data = await response.json();
        
        if (active) {
          set({ myListings: data, loadingMy: false });
        }
      } catch (error: any) {
        console.error('[Listings] fetchMyListings error:', error.message);
        if (active) {
          set({ error: error.message, loadingMy: false });
        }
      }
    };

    fetchMy();

    return () => {
      active = false;
    };
  },

  fetchBuyHistory: () => {
    let active = true;
    const token = useAuthStore.getState().token;
    const user = useAuthStore.getState().user;
    if (!token || !user) return () => {};

    set({ loadingBuyHistory: true, error: null });

    const fetchBuy = async () => {
      try {
        const response = await fetch(`${API_URL}/api/listings?buyerId=${user.id}&status=sold`);
        if (!response.ok) throw new Error('Failed to fetch buy history');
        const data = await response.json();
        
        if (active) {
          set({ buyHistory: data, loadingBuyHistory: false });
        }
      } catch (error: any) {
        console.error('[Listings] fetchBuyHistory error:', error.message);
        if (active) {
          set({ error: error.message, loadingBuyHistory: false });
        }
      }
    };

    fetchBuy();

    return () => {
      active = false;
    };
  },

  createListing: async (data, photoUris, videoUri) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Not authenticated');

    const photoUrls: string[] = [];
    for (let i = 0; i < photoUris.length; i++) {
      const url = await uploadImageToBackend(photoUris[i], token);
      photoUrls.push(url);
    }

    const response = await fetch(`${API_URL}/api/listings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
        images: photoUrls,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create listing');
    }

    console.log('[Listings] Listing created successfully on custom backend!');
    get().fetchActiveListings(); // Refresh list
  },

  updateListingStatus: async (id, status, buyerId) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/listings/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status, buyerId }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update listing status');
    }

    // Refresh listings
    get().fetchActiveListings();
    get().fetchMyListings();
  },

  updateListing: async (id, data, photoUris) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Not authenticated');

    const photoUrls: string[] = [];
    for (let i = 0; i < photoUris.length; i++) {
      if (photoUris[i].startsWith('http')) {
        photoUrls.push(photoUris[i]);
      } else {
        const url = await uploadImageToBackend(photoUris[i], token);
        photoUrls.push(url);
      }
    }

    const response = await fetch(`${API_URL}/api/listings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
        images: photoUrls,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update listing');
    }

    get().fetchActiveListings();
    get().fetchMyListings();
  },

  deleteListing: async (id) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/listings/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete listing');
    }

    get().fetchActiveListings();
    get().fetchMyListings();
  },

  reportListing: async (listingId, reason) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ listingId, reason }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to submit report');
    }

    console.log(`[Listings] Report created for listing ${listingId}: ${reason}`);
  },
}));
