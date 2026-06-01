import { create } from 'zustand';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase.config';

const CLOUDINARY_CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// Log config on startup to verify env vars are loaded
console.log('[Cloudinary] Cloud name:', CLOUDINARY_CLOUD_NAME ?? '❌ MISSING - restart Expo with --clear');
console.log('[Cloudinary] Upload preset:', CLOUDINARY_UPLOAD_PRESET ?? '❌ MISSING - restart Expo with --clear');

const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

interface Listing {
  id: string;
  userId: string;
  category: string;
  brand: string;
  yearOfPurchase: number;
  condition: string;
  conditionDescription?: string;
  pricingType: string;
  price: number | null;
  city: string;
  state: string;
  photos: string[];
  video: string | null;
  description: string;
  status: 'pending' | 'active' | 'sold';
  createdAt: any;
}

interface ListingsStore {
  activeListings: Listing[];
  myListings: Listing[];
  loadingActive: boolean;
  loadingMy: boolean;
  error: string | null;
  fetchActiveListings: () => () => void;
  fetchMyListings: () => () => void;
  createListing: (data: any, photoUris: string[], videoUri?: string | null) => Promise<void>;
  updateListingStatus: (id: string, status: 'sold' | 'active' | 'pending') => Promise<void>;
  updateListing: (id: string, data: any, photoUris: string[]) => Promise<void>;
  deleteListing: (id: string) => Promise<void>;
}

// Upload a single image URI to Cloudinary and return its secure URL
const uploadImageToCloudinary = async (uri: string, index: number): Promise<string> => {
  console.log(`[Cloudinary] Uploading photo ${index + 1}...`);

  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'image/jpeg',
    name: `photo_${index}.jpg`,
  } as any);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'hallmarkhub/listings');

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error('[Cloudinary] Upload failed:', response.status, errorBody);
    let cloudinaryMessage = `HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      cloudinaryMessage = parsed?.error?.message || cloudinaryMessage;
    } catch (_) {}
    throw new Error(`Photo upload failed: ${cloudinaryMessage}`);
  }

  const result = await response.json();
  console.log(`[Cloudinary] Photo ${index + 1} uploaded: ${result.secure_url}`);
  return result.secure_url;
};

export const useListingsStore = create<ListingsStore>((set) => ({
  activeListings: [],
  myListings: [],
  loadingActive: false,
  loadingMy: false,
  error: null,

  fetchActiveListings: () => {
    set({ loadingActive: true, error: null });
    const q = query(collection(db, 'listings'), where('status', '==', 'active'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listings = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Listing));
      set({ activeListings: listings, loadingActive: false });
    }, (error) => {
      console.error('[Listings] fetchActiveListings error:', error.message);
      set({ error: error.message, loadingActive: false });
    });
    return unsubscribe;
  },

  fetchMyListings: () => {
    if (!auth.currentUser) return () => {};
    set({ loadingMy: true, error: null });
    const q = query(collection(db, 'listings'), where('userId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listings = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Listing));
      set({ myListings: listings, loadingMy: false });
    }, (error) => {
      console.error('[Listings] fetchMyListings error:', error.message);
      set({ error: error.message, loadingMy: false });
    });
    return unsubscribe;
  },

  createListing: async (data, photoUris, videoUri) => {
    if (!auth.currentUser) throw new Error('Not authenticated');

    const userId = auth.currentUser.uid;
    const photoUrls: string[] = [];

    // Upload all photos to Cloudinary
    for (let i = 0; i < photoUris.length; i++) {
      const url = await uploadImageToCloudinary(photoUris[i], i);
      photoUrls.push(url);
    }

    // Save listing to Firestore — status 'active' so it appears immediately in home feed
    await addDoc(collection(db, 'listings'), {
      ...data,
      userId,
      photos: photoUrls,
      video: null,
      status: 'active',
      createdAt: serverTimestamp(),
    });

    console.log('[Listings] Listing created successfully!');
  },

  updateListingStatus: async (id, status) => {
    await updateDoc(doc(db, 'listings', id), { status });
  },

  updateListing: async (id, data, photoUris) => {
    if (!auth.currentUser) throw new Error('Not authenticated');

    const photoUrls: string[] = [];

    for (let i = 0; i < photoUris.length; i++) {
      if (photoUris[i].startsWith('http')) {
        photoUrls.push(photoUris[i]);
      } else {
        const url = await uploadImageToCloudinary(photoUris[i], i);
        photoUrls.push(url);
      }
    }

    await updateDoc(doc(db, 'listings', id), {
      ...data,
      photos: photoUrls,
    });
  },

  deleteListing: async (id) => {
    await deleteDoc(doc(db, 'listings', id));
  },
}));
