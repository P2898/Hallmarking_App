import { useState, useEffect } from 'react';
import { 
  Search, 
  Flag, 
  CheckCircle, 
  AlertTriangle,
  Send,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import { useChatsStore } from '../store/chatsStore';
import { useUsersStore } from '../store/usersStore';
import { useListingsStore } from '../store/listingsStore';

export const Chats = () => {
  const { chats, flagChat, resolveChat, subscribeToChats, addMessage } = useChatsStore();
  const { subscribeToUsers } = useUsersStore();
  const { subscribeToListings } = useListingsStore();
  
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'flagged' | 'resolved'>('all');
  const [adminMsg, setAdminMsg] = useState('');

  useEffect(() => {
    subscribeToUsers();
    subscribeToListings();
    subscribeToChats();
  }, [subscribeToUsers, subscribeToListings, subscribeToChats]);

  // Selected chat details
  const selectedChat = chats.find(c => c.id === selectedChatId);

  // Filtered Chats
  const filteredChats = chats.filter(chat => {
    const matchesSearch = 
      chat.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.listingTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSendAdminMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminMsg.trim() || !selectedChatId) return;

    addMessage(selectedChatId, {
      senderId: 'ADMIN-001',
      senderName: 'System Admin',
      text: adminMsg
    });
    setAdminMsg('');
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-gray-50">
      {/* Chats Sidebar List */}
      <div className={`w-full md:w-96 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 ${
        selectedChatId ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Search and Filters */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search chat sessions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 w-full rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all text-xs"
            />
          </div>

          <div className="flex gap-1 bg-gray-50 p-1 rounded-lg">
            {(['all', 'active', 'flagged', 'resolved'] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-1 py-1 text-[10px] font-bold uppercase rounded-md transition-colors ${
                  statusFilter === status 
                    ? 'bg-dark text-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {filteredChats.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              No chat logs found matching filters.
            </div>
          ) : (
            filteredChats.map(chat => (
              <button
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`w-full p-4 text-left hover:bg-gray-50/50 transition-colors flex flex-col gap-2 relative ${
                  selectedChatId === chat.id ? 'bg-gold/5 border-l-4 border-gold' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-gray-800">{chat.buyerName} ↔ {chat.sellerName}</h4>
                    <p className="text-xs font-semibold text-gold line-clamp-1">{chat.listingTitle}</p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                    chat.status === 'flagged' ? 'bg-red-100 text-red-700' :
                    chat.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {chat.status}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 line-clamp-1 italic">{chat.lastMessage}</p>
                <span className="text-[10px] text-gray-400 self-end">{chat.lastMessageTime}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Conversation Window */}
      <div className={`flex-1 flex flex-col h-full bg-white relative ${
        !selectedChatId ? 'hidden md:flex justify-center items-center text-gray-400' : 'flex'
      }`}>
        {selectedChat ? (
          <>
            {/* Conversation Header */}
            <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedChatId(null)}
                  className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg md:hidden"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">
                    {selectedChat.buyerName} ↔ {selectedChat.sellerName}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Listing: <span className="font-semibold text-gold">{selectedChat.listingTitle}</span>
                  </p>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2">
                {selectedChat.status === 'flagged' && (
                  <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-xl font-medium animate-pulse">
                    <AlertTriangle size={14} /> Flagged for sharing phone number
                  </div>
                )}
                
                {selectedChat.status !== 'resolved' ? (
                  <button 
                    onClick={() => resolveChat(selectedChat.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 hover:bg-green-100 rounded-xl transition-colors"
                  >
                    <CheckCircle size={14} /> Mark Resolved
                  </button>
                ) : (
                  <span className="text-xs text-gray-500 font-semibold flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                    <CheckCircle size={14} /> Issue Resolved
                  </span>
                )}

                {selectedChat.status === 'active' && (
                  <button 
                    onClick={() => flagChat(selectedChat.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-xl transition-colors"
                  >
                    <Flag size={14} /> Flag Chat
                  </button>
                )}
              </div>
            </div>

            {/* Conversation Flow */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
              {selectedChat.status === 'flagged' && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2 max-w-lg mx-auto">
                  <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Chat Flagged by System</p>
                    <p className="mt-0.5 text-[11px]">This conversation was flagged automatically. Sharing personal details (phone number, external payment links) is prohibited.</p>
                  </div>
                </div>
              )}

              {selectedChat.messages.map((msg, index) => {
                const isAdmin = msg.senderId === 'ADMIN-001';
                const isBuyer = msg.senderId === selectedChat.buyerId;

                return (
                  <div 
                    key={msg.id || index}
                    className={`flex flex-col max-w-[70%] ${
                      isAdmin ? 'mx-auto items-center' :
                      isBuyer ? 'mr-auto items-start' : 'ml-auto items-end'
                    }`}
                  >
                    {/* Bubble name */}
                    {!isAdmin && (
                      <span className="text-[10px] text-gray-400 mb-0.5 px-1">{msg.senderName}</span>
                    )}

                    {/* Bubble Box */}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                      isAdmin ? 'bg-amber-100 text-amber-800 border border-amber-200 text-center font-medium shadow-sm' :
                      isBuyer ? 'bg-white text-gray-800 border border-gray-150 rounded-tl-none' : 'bg-dark text-white rounded-tr-none'
                    }`}>
                      <p>{msg.text}</p>
                    </div>

                    <span className="text-[9px] text-gray-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                );
              })}
            </div>

            {/* Send Notice/Admin Msg Form */}
            <form 
              onSubmit={handleSendAdminMessage}
              className="p-4 border-t border-gray-200 bg-white flex items-center gap-3 sticky bottom-0"
            >
              <input 
                type="text" 
                placeholder="Send warning / official notification to this conversation..." 
                value={adminMsg}
                onChange={(e) => setAdminMsg(e.target.value)}
                className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
              />
              <button 
                type="submit"
                className="p-2.5 bg-gold text-dark font-bold rounded-xl hover:bg-gold-dark transition-all flex items-center justify-center flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3 py-20 text-gray-400">
            <MessageSquare size={48} className="stroke-[1.5]" />
            <p className="font-semibold text-sm">Select a conversation session to monitor details</p>
          </div>
        )}
      </div>
    </div>
  );
};
