import { create } from 'zustand';

export interface Listing {
  id: string;
  sellerId: string;
  category: 'XRF Machines' | 'Laser Marking' | 'Micro Balances' | 'Fire Assay Equipment';
  brand: string;
  year: number;
  condition: 'Excellent' | 'Good' | 'Fair' | 'For Parts';
  price: number;
  isMakeOffer: boolean;
  city: string;
  state: string;
  status: 'Active' | 'Pending' | 'Sold';
  image: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  buyerName: string;
  buyerCompany: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface AppNotification {
  id: string;
  type: 'chat' | 'offer' | 'approved' | 'rejected' | 'match' | 'announcement';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface DataState {
  listings: Listing[];
  chats: Chat[];
  notifications: AppNotification[];
  addListing: (listing: Omit<Listing, 'id' | 'status'>) => void;
  markAsSold: (id: string) => void;
  deleteListing: (id: string) => void;
  addOffer: (listingId: string, amount: number, message?: string) => void;
  sendMessage: (chatId: string, text: string) => void;
  markNotificationRead: (id: string) => void;
}

const MOCK_LISTINGS: Listing[] = [
  { id: '1', sellerId: '2', category: 'XRF Machines', brand: 'Fischer', year: 2021, condition: 'Excellent', price: 850000, isMakeOffer: true, city: 'Mumbai', state: 'Maharashtra', status: 'Active', image: 'mock-1', description: 'Excellent condition Fischer XRF machine. Rarely used.' },
  { id: '2', sellerId: '3', category: 'Laser Marking', brand: 'Max Photonics', year: 2020, condition: 'Good', price: 320000, isMakeOffer: false, city: 'Surat', state: 'Gujarat', status: 'Active', image: 'mock-2', description: 'Standard 20W laser marking machine.' },
  { id: '3', sellerId: '1', category: 'Micro Balances', brand: 'Sartorius', year: 2022, condition: 'Excellent', price: 450000, isMakeOffer: true, city: 'Mumbai', state: 'Maharashtra', status: 'Active', image: 'mock-3', description: 'Highly accurate micro balance.' },
  { id: '4', sellerId: '4', category: 'Fire Assay Equipment', brand: 'Local', year: 2018, condition: 'Fair', price: 150000, isMakeOffer: true, city: 'Delhi', state: 'Delhi', status: 'Active', image: 'mock-4', description: 'Complete fire assay setup.' },
  { id: '5', sellerId: '5', category: 'XRF Machines', brand: 'Skyray', year: 2019, condition: 'Good', price: 550000, isMakeOffer: false, city: 'Rajkot', state: 'Gujarat', status: 'Active', image: 'mock-5', description: 'Skyray EDX3000.' },
  { id: '6', sellerId: '1', category: 'Laser Marking', brand: 'Raycus', year: 2021, condition: 'Excellent', price: 280000, isMakeOffer: true, city: 'Mumbai', state: 'Maharashtra', status: 'Pending', image: 'mock-6', description: 'Raycus 30W.' },
  { id: '7', sellerId: '2', category: 'Micro Balances', brand: 'Mettler Toledo', year: 2023, condition: 'Excellent', price: 520000, isMakeOffer: false, city: 'Chennai', state: 'Tamil Nadu', status: 'Active', image: 'mock-7', description: 'New condition.' },
  { id: '8', sellerId: '3', category: 'XRF Machines', brand: 'Olympus', year: 2017, condition: 'Good', price: 700000, isMakeOffer: true, city: 'Kolkata', state: 'West Bengal', status: 'Sold', image: 'mock-8', description: 'Handheld XRF.' },
];

const MOCK_CHATS: Chat[] = [
  { id: '1', listingId: '1', buyerId: '1', sellerId: '2', buyerName: 'Mock User', buyerCompany: 'HallmarkHub Jewelry', lastMessage: 'Is the price negotiable?', timestamp: '10:30 AM', unreadCount: 0, messages: [ { id: 'm1', senderId: '1', text: 'Hi, is the price negotiable?', timestamp: '10:30 AM' } ] },
  { id: '2', listingId: '3', buyerId: '4', sellerId: '1', buyerName: 'Rahul Verma', buyerCompany: 'Verma Jewellers', lastMessage: 'I can offer 4L', timestamp: 'Yesterday', unreadCount: 2, messages: [ { id: 'm1', senderId: '4', text: 'I can offer 4L', timestamp: 'Yesterday' } ] },
];

const MOCK_NOTIFICATIONS: AppNotification[] = [
  { id: '1', type: 'chat', title: 'New Message', message: 'Rahul Verma sent you a message', timestamp: '2 hours ago', isRead: false },
  { id: '2', type: 'offer', title: 'Offer Received', message: 'You received an offer of ₹4,00,000 for Sartorius Micro Balance', timestamp: 'Yesterday', isRead: false },
  { id: '3', type: 'approved', title: 'Account Approved', message: 'Welcome to HallmarkHub! Your account is now active.', timestamp: '2 days ago', isRead: true },
];

export const useDataStore = create<DataState>((set) => ({
  listings: MOCK_LISTINGS,
  chats: MOCK_CHATS,
  notifications: MOCK_NOTIFICATIONS,

  addListing: (listing) => set((state) => ({
    listings: [{ ...listing, id: Math.random().toString(), status: 'Pending' }, ...state.listings]
  })),

  markAsSold: (id) => set((state) => ({
    listings: state.listings.map(l => l.id === id ? { ...l, status: 'Sold' } : l)
  })),

  deleteListing: (id) => set((state) => ({
    listings: state.listings.filter(l => l.id !== id)
  })),

  addOffer: (listingId, amount, message) => set((state) => {
    // Mock adding offer logic
    return state;
  }),

  sendMessage: (chatId, text) => set((state) => ({
    chats: state.chats.map(c => c.id === chatId ? { 
      ...c, 
      lastMessage: text,
      timestamp: 'Just now',
      messages: [...c.messages, { id: Math.random().toString(), senderId: '1', text, timestamp: 'Just now' }]
    } : c)
  })),

  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
  }))
}));
