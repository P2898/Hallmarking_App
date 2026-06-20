import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  listingId: string;
  listingTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  messages: ChatMessage[];
  status: 'active' | 'flagged' | 'resolved';
}

interface ChatsState {
  chats: ChatSession[];
  loading: boolean;
  subscribeToChats: () => void;
  flagChat: (id: string) => Promise<void>;
  resolveChat: (id: string) => Promise<void>;
  addMessage: (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
}

export const useChatsStore = create<ChatsState>((set) => ({
  chats: [],
  loading: false,

  subscribeToChats: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    set({ loading: true });

    try {
      const response = await fetch(`${API_URL}/api/chats/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch chats');
      const data = await response.json();

      const newChats: ChatSession[] = data.map((d: any) => {
        const lastMessageTime = d.updatedAt 
          ? new Date(d.updatedAt).toLocaleDateString() 
          : 'New';

        return {
          id: d.id,
          buyerId: d.buyer?.id || 'unknown',
          buyerName: d.buyer?.displayName || 'Unknown User',
          sellerId: d.seller?.id || 'unknown',
          sellerName: d.seller?.displayName || 'Unknown Seller',
          listingId: d.listing?.id || '',
          listingTitle: d.listing?.title || 'Deleted Listing',
          lastMessage: `[Chat has ${d.unreadCount || 0} unread]`, // Backend currently doesn't store last message text directly on Chat model
          lastMessageTime,
          messages: [], // Admin won't fetch all individual messages right now unless we add an endpoint
          status: 'active', // Chat status isn't on the backend model yet
        };
      });

      set({ chats: newChats, loading: false });
    } catch (error: any) {
      console.error("Fetch chats error:", error.message);
      set({ chats: [], loading: false });
    }
  },

  flagChat: async (id: string) => {
    // Add logic later if backend supports chat flagging
    set((state) => ({
      chats: state.chats.map((c) => c.id === id ? { ...c, status: 'flagged' } : c)
    }));
  },

  resolveChat: async (id: string) => {
    // Add logic later if backend supports chat resolution
    set((state) => ({
      chats: state.chats.map((c) => c.id === id ? { ...c, status: 'resolved' } : c)
    }));
  },

  addMessage: (chatId, message) => {
    set((state) => ({
      chats: state.chats.map(c => c.id === chatId ? {
        ...c,
        messages: [...c.messages, { ...message, id: Math.random().toString(), timestamp: new Date().toLocaleTimeString() }]
      } : c)
    }));
  },
}));
