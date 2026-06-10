import { create } from 'zustand';
import { db } from '../utils/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, query } from 'firebase/firestore';
import { useUsersStore } from './usersStore';
import { useListingsStore } from './listingsStore';

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
  addMessage: (chatId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => Promise<void>;
}

let chatsUnsubscribe: (() => void) | null = null;
const messageUnsubscribes: Record<string, () => void> = {};

export const useChatsStore = create<ChatsState>((set) => ({
  chats: [],
  loading: true,

  subscribeToChats: () => {
    if (chatsUnsubscribe) return;
    set({ loading: true });

    chatsUnsubscribe = onSnapshot(collection(db, 'chats'), (snapshot) => {
      const users = useUsersStore.getState().users;
      const listings = useListingsStore.getState().listings;
      
      const newChats: ChatSession[] = [];

      snapshot.forEach((d) => {
        const data = d.data();
        
        // Participants usually has 2 IDs. We assume first is buyer, second is seller (or vice versa).
        const participants = data.participants || [];
        const p1Id = participants[0] || 'unknown';
        const p2Id = participants[1] || 'unknown';
        
        const p1 = users.find(u => u.id === p1Id);
        const p2 = users.find(u => u.id === p2Id);
        
        const listing = listings.find(l => l.id === data.listingId);
        
        let status: 'active' | 'flagged' | 'resolved' = 'active';
        if (data.status === 'flagged') status = 'flagged';
        if (data.status === 'resolved') status = 'resolved';

        let lastMessageTime = 'New';
        if (data.timestamp) {
           const date = new Date(data.timestamp.seconds * 1000);
           lastMessageTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (data.createdAt) {
           const date = new Date(data.createdAt.seconds * 1000);
           lastMessageTime = date.toLocaleDateString();
        }

        const chatSession: ChatSession = {
          id: d.id,
          buyerId: p1Id,
          buyerName: p1 ? p1.name : 'Unknown User',
          sellerId: p2Id,
          sellerName: p2 ? p2.name : 'Unknown Seller',
          listingId: data.listingId || '',
          listingTitle: listing ? listing.title : 'Deleted Listing',
          lastMessage: data.lastMessage || 'No messages yet.',
          lastMessageTime,
          messages: [],
          status,
        };

        newChats.push(chatSession);

        // Fetch messages for this chat if not already subscribed
        if (!messageUnsubscribes[d.id]) {
          const q = query(collection(db, `chats/${d.id}/messages`));
          messageUnsubscribes[d.id] = onSnapshot(q, (msgSnapshot) => {
             const msgs: ChatMessage[] = [];
             msgSnapshot.forEach(mDoc => {
               const mData = mDoc.data();
               const sender = users.find(u => u.id === mData.senderId);
               
               let msgTime = '';
               if (mData.timestamp) {
                  const date = new Date(mData.timestamp.seconds * 1000);
                  msgTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
               }

               msgs.push({
                 id: mDoc.id,
                 senderId: mData.senderId,
                 senderName: sender ? sender.name : (mData.senderId === 'ADMIN-001' ? 'System Admin' : 'Unknown'),
                 text: mData.text,
                 timestamp: msgTime
               });
             });
             
             // Update the specific chat with its new messages
             set((state) => ({
               chats: state.chats.map(c => c.id === d.id ? { 
                 ...c, 
                 messages: msgs.sort((a, b) => a.timestamp.localeCompare(b.timestamp)) 
               } : c)
             }));
          });
        }
      });

      // We initialize chats without messages first. The message listeners will populate them quickly.
      // But we preserve existing messages if this is an update to the chats collection.
      set((state) => {
        const mergedChats = newChats.map(newChat => {
          const existing = state.chats.find(c => c.id === newChat.id);
          return existing ? { ...newChat, messages: existing.messages } : newChat;
        });
        return { chats: mergedChats, loading: false };
      });
      
    }, (error) => {
      console.error("Firestore chats connection error:", error.message);
      set({ chats: [], loading: false });
    });
  },

  flagChat: async (id) => {
    try {
      await updateDoc(doc(db, 'chats', id), { status: 'flagged' });
    } catch (e) {
      console.error(e);
      // Optimistic update fallback
      set((state) => ({
        chats: state.chats.map((c) => c.id === id ? { ...c, status: 'flagged' } : c)
      }));
    }
  },

  resolveChat: async (id) => {
    try {
      await updateDoc(doc(db, 'chats', id), { status: 'resolved' });
    } catch (e) {
      console.error(e);
      set((state) => ({
        chats: state.chats.map((c) => c.id === id ? { ...c, status: 'resolved' } : c)
      }));
    }
  },

  addMessage: async (chatId, msg) => {
    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        senderId: msg.senderId,
        text: msg.text,
        timestamp: serverTimestamp(),
        read: false
      });
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: msg.text,
        timestamp: serverTimestamp(),
        lastSenderId: msg.senderId
      });
    } catch (e) {
      console.error(e);
    }
  }
}));
