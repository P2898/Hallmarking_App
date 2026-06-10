import { create } from 'zustand';
import { collection, query, where, onSnapshot, addDoc, doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { auth, db } from '../../firebase.config';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
  read: boolean;
}

interface Chat {
  id: string;
  participants: string[];
  listingId: string;
  createdAt: any;
  lastMessage: string | null;
  unreadCount: number;
  lastSenderId?: string | null;
}

interface Offer {
  id: string;
  amount: number;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  senderId: string;
  timestamp: any;
}

interface ChatStore {
  chats: Chat[];
  messages: { [chatId: string]: Message[] };
  offers: { [chatId: string]: Offer[] };
  loadingChats: boolean;
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

  fetchChats: () => {
    if (!auth.currentUser) return () => {};
    set({ loadingChats: true });
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      set({ chats, loadingChats: false });
    });
    return unsubscribe;
  },

  fetchMessages: (chatId) => {
    const q = query(collection(db, `chats/${chatId}/messages`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      set((state) => ({
        messages: { ...state.messages, [chatId]: msgs.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0)) }
      }));
    });
    return unsubscribe;
  },

  fetchOffers: (chatId) => {
    const q = query(collection(db, `chats/${chatId}/offers`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const offs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Offer));
      set((state) => ({
        offers: { ...state.offers, [chatId]: offs.sort((a, b) => (a.timestamp?.toMillis() || 0) - (b.timestamp?.toMillis() || 0)) }
      }));
    });
    return unsubscribe;
  },

  sendMessage: async (chatId, text) => {
    if (!auth.currentUser) return;
    await addDoc(collection(db, `chats/${chatId}/messages`), {
      senderId: auth.currentUser.uid,
      text,
      timestamp: serverTimestamp(),
      read: false,
    });
    // Update last message in chat document
    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: text,
      timestamp: serverTimestamp(),
      lastSenderId: auth.currentUser.uid,
      unreadCount: increment(1)
    });
  },

  createOffer: async (chatId, amount, message) => {
    if (!auth.currentUser) return;
    await addDoc(collection(db, `chats/${chatId}/offers`), {
      amount,
      message,
      status: 'pending',
      senderId: auth.currentUser.uid,
      timestamp: serverTimestamp(),
    });

    // Automatically send a chat message so the seller sees the offer in the chat room
    const textMessage = `🔔 I made an offer of ₹${amount.toLocaleString('en-IN')}${message ? `\n\nNote: ${message}` : ''}`;
    await get().sendMessage(chatId, textMessage);
  },

  updateOfferStatus: async (chatId, offerId, status) => {
    await updateDoc(doc(db, `chats/${chatId}/offers`, offerId), { status });
  },

  getOrCreateChat: async (sellerId, listingId) => {
    if (!auth.currentUser) throw new Error('Not authenticated');
    
    // First, try to find an existing chat with this seller (ignore listingId)
    const { chats } = get();
    const existingChat = chats.find(c => 
      c.participants.includes(sellerId) && 
      c.participants.includes(auth.currentUser!.uid)
    );
    
    if (existingChat) {
      return existingChat.id;
    }

    // Create a new one
    const newChatRef = await addDoc(collection(db, 'chats'), {
      participants: [auth.currentUser.uid, sellerId],
      listingId,
      createdAt: serverTimestamp(),
      lastMessage: null,
      unreadCount: 0,
      lastSenderId: null,
    });
    
    return newChatRef.id;
  }
}));
