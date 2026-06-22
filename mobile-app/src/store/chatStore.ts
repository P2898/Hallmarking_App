import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from './authStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

interface Chat {
  id: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  createdAt: string;
  lastMessage: string | null;
  unreadCount: number;
  lastSenderId?: string | null;
  buyer?: {
    id: string;
    displayName: string | null;
    photoURL: string | null;
  };
  seller?: {
    id: string;
    displayName: string | null;
    photoURL: string | null;
  };
  listing?: {
    id: string;
    title: string;
    price: number;
    images: string[];
  };
}

interface Offer {
  id: string;
  amount: number;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  senderId: string;
  createdAt: string;
}

interface ChatStore {
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  offers: { [chatId: string]: Offer[] };
  loadingChats: boolean;
  socket: Socket | null;
  fetchChats: () => () => void;
  fetchMessages: (chatId: string) => () => void;
  fetchOffers: (chatId: string) => () => void;
  sendMessage: (chatId: string, text: string) => Promise<void>;
  createOffer: (chatId: string, amount: number, message: string) => Promise<void>;
  updateOfferStatus: (chatId: string, offerId: string, status: 'accepted' | 'declined') => Promise<void>;
  getOrCreateChat: (sellerId: string, listingId: string) => Promise<string>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  chats: [],
  messages: {},
  offers: {},
  loadingChats: false,
  socket: null,

  fetchChats: () => {
    const token = useAuthStore.getState().token;
    const user = useAuthStore.getState().user;
    if (!token || !user) return () => {};

    set({ loadingChats: true });

    // Establish WebSocket Connection if not already connected
    let socket = get().socket;
    if (!socket) {
      socket = io(API_URL, {
        auth: { token },
      });
      set({ socket });

      socket.on('connect', () => {
        console.log('[Socket] Connected, joining user room:', user.id);
        socket?.emit('joinUser', user.id);
        // Re-join any active chat room on reconnect
        const currentMessages = get().messages;
        Object.keys(currentMessages).forEach(cId => {
          socket?.emit('joinChat', cId);
        });
      });

      socket.on('chatUpdate', (updatedChat: Chat) => {
        set((state) => {
          const existing = state.chats.find((c) => c.id === updatedChat.id);
          // Merge: preserve buyer/seller/listing from existing chat if the update is missing them
          const merged: Chat = {
            ...existing,
            ...updatedChat,
            buyer: updatedChat.buyer ?? existing?.buyer,
            seller: updatedChat.seller ?? existing?.seller,
            listing: updatedChat.listing ?? existing?.listing,
          };
          const filtered = state.chats.filter((c) => c.id !== updatedChat.id);
          return { chats: [merged, ...filtered] };
        });
      });
    }

    const fetchAllChats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/chats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const chatsData = await response.json();
          set({ chats: chatsData, loadingChats: false });
        }
      } catch (error) {
        console.error('[ChatStore] Failed to fetch chats:', error);
        set({ loadingChats: false });
      }
    };

    fetchAllChats();

    return () => {
      // Keep socket alive for real-time notifications in background, but clean up state listener references if required
    };
  },

  fetchMessages: (chatId) => {
    const token = useAuthStore.getState().token;
    if (!token) return () => {};

    const socket = get().socket;
    if (socket) {
      socket.emit('joinChat', chatId);

      // Use a named handler so we can remove exactly this listener later
      // (socket.off('message') without a handler removes ALL listeners!)
      const messageHandler = (message: Message) => {
        // Only handle messages for this specific chat
        if (message.chatId && message.chatId !== chatId) return;
        set((state) => {
          const currentMsgs = state.messages[chatId] || [];
          // Avoid duplicate messages
          if (currentMsgs.some((m) => m.id === message.id)) return state;
          return {
            messages: {
              ...state.messages,
              [chatId]: [...currentMsgs, message].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
            },
          };
        });
      };

      // Remove any previous listener for this event before adding a new one
      socket.off('message', messageHandler);
      socket.on('message', messageHandler);

      const loadMessages = async () => {
        try {
          const response = await fetch(`${API_URL}/api/chats/${chatId}/messages`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const msgs = await response.json();
            set((state) => {
              const userId = useAuthStore.getState().user?.id;
              const updatedChats = state.chats.map(c => {
                if (c.id === chatId && c.lastSenderId !== userId) {
                  return { ...c, unreadCount: 0 };
                }
                return c;
              });
              return {
                messages: { ...state.messages, [chatId]: msgs },
                chats: updatedChats
              };
            });
          }
        } catch (error) {
          console.error('[ChatStore] Fetch messages failed:', error);
        }
      };

      loadMessages();

      return () => {
        // Remove only this specific named handler, not all message listeners
        socket.off('message', messageHandler);
      };
    }

    // No socket yet — just load messages from REST
    const loadMessages = async () => {
      try {
        const response = await fetch(`${API_URL}/api/chats/${chatId}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const msgs = await response.json();
          set((state) => ({ messages: { ...state.messages, [chatId]: msgs } }));
        }
      } catch (error) {
        console.error('[ChatStore] Fetch messages failed:', error);
      }
    };
    loadMessages();
    return () => {};
  },

  fetchOffers: (chatId) => {
    const token = useAuthStore.getState().token;
    if (!token) return () => {};

    const socket = get().socket;
    if (socket) {
      socket.on('offer', (offer: Offer) => {
        set((state) => {
          const currentOffers = state.offers[chatId] || [];
          if (currentOffers.some((o) => o.id === offer.id)) return state;
          return {
            offers: {
              ...state.offers,
              [chatId]: [...currentOffers, offer].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
            },
          };
        });
      });

      socket.on('offerStatusUpdate', (updatedOffer: Offer) => {
        set((state) => {
          const currentOffers = state.offers[chatId] || [];
          const mapped = currentOffers.map((o) => (o.id === updatedOffer.id ? updatedOffer : o));
          return {
            offers: {
              ...state.offers,
              [chatId]: mapped,
            },
          };
        });
      });
    }

    const loadOffers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/chats/${chatId}/offers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const offs = await response.json();
          set((state) => ({
            offers: { ...state.offers, [chatId]: offs },
          }));
        }
      } catch (error) {
        console.error('[ChatStore] Fetch offers failed:', error);
      }
    };

    loadOffers();

    return () => {
      if (socket) {
        socket.off('offer');
        socket.off('offerStatusUpdate');
      }
    };
  },

  sendMessage: async (chatId, text) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    const response = await fetch(`${API_URL}/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const message = await response.json();

    // Optimistically update local message state if not received by socket yet
    set((state) => {
      const currentMsgs = state.messages[chatId] || [];
      if (currentMsgs.some((m) => m.id === message.id)) return state;
      return {
        messages: {
          ...state.messages,
          [chatId]: [...currentMsgs, message].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
        },
      };
    });
  },

  createOffer: async (chatId, amount, message) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    const response = await fetch(`${API_URL}/api/chats/${chatId}/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ amount, message }),
    });

    if (!response.ok) {
      throw new Error('Failed to make offer');
    }

    const offer = await response.json();

    // Automatically send a chat message so the seller sees the offer in the chat room
    const textMessage = `🔔 I made an offer of ₹${amount.toLocaleString('en-IN')}${message ? `\n\nNote: ${message}` : ''}`;
    await get().sendMessage(chatId, textMessage);

    // Optimistically update offer list
    set((state) => {
      const currentOffers = state.offers[chatId] || [];
      if (currentOffers.some((o) => o.id === offer.id)) return state;
      return {
        offers: {
          ...state.offers,
          [chatId]: [...currentOffers, offer].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
        },
      };
    });
  },

  updateOfferStatus: async (chatId, offerId, status) => {
    const token = useAuthStore.getState().token;
    if (!token) return;

    const response = await fetch(`${API_URL}/api/chats/${chatId}/offers/${offerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update offer status');
    }

    const updatedOffer = await response.json();

    // Optimistically update locally
    set((state) => {
      const currentOffers = state.offers[chatId] || [];
      const mapped = currentOffers.map((o) => (o.id === updatedOffer.id ? updatedOffer : o));
      return {
        offers: {
          ...state.offers,
          [chatId]: mapped,
        },
      };
    });

    // Send a message informing status change
    const actionText = status === 'accepted' ? 'accepted' : 'declined';
    const notificationText = `🔔 I ${actionText} the offer of ₹${updatedOffer.amount.toLocaleString('en-IN')}`;
    await get().sendMessage(chatId, notificationText);
  },

  getOrCreateChat: async (sellerId, listingId) => {
    const token = useAuthStore.getState().token;
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_URL}/api/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ sellerId, listingId }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to open chat');
    }

    const chat = await response.json();
    
    // Add to chats array if not present
    set((state) => {
      const exists = state.chats.some((c) => c.id === chat.id);
      if (exists) return state;
      return { chats: [chat, ...state.chats] };
    });

    return chat.id;
  },
}));
