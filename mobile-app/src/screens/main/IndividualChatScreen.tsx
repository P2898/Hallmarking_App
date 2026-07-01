import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../types/navigation';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useListingsStore } from '../../store/listingsStore';
import { useTranslation } from 'react-i18next';
import { Alert, Modal } from 'react-native';

export const IndividualChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MainStackParamList, 'IndividualChat'>>();
  const chatId = route.params?.id;
  
  const { chats, messages: allMessages, fetchMessages, sendMessage } = useChatStore();
  const { user } = useAuthStore();
  const { myListings, updateListingStatus } = useListingsStore();
  const { t } = useTranslation();
  const chat = chats.find(c => c.id === chatId);
  const messages = allMessages[chatId] || [];
  
  React.useEffect(() => {
    if (chatId) {
      const unsubscribe = fetchMessages(chatId);
      return () => unsubscribe();
    }
  }, [chatId, fetchMessages]);

  const otherUser = chat ? (chat.buyerId === user?.id ? chat.seller : chat.buyer) : null;
  const chatName = otherUser?.displayName || 'User';
  const chatCompany = (otherUser as any)?.companyName || 'Company';

  const [message, setMessage] = useState('');
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  const handleSend = () => {
    if (message.trim() && chatId) {
      sendMessage(chatId, message.trim());
      setMessage('');
    }
  };

  const associatedListing = chat ? myListings.find(l => l.id === chat.listingId) : null;
  const isSeller = !!associatedListing;
  const otherParticipantId = chat ? (chat.buyerId === user?.id ? chat.sellerId : chat.buyerId) : null;

  const handleMarkSold = () => {
    if (!associatedListing || !otherParticipantId) return;
    
    Alert.alert(
      "Mark as Sold",
      `Are you sure you want to mark this item as sold to ${chatName}? It will appear in their Buy History.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Mark Sold", 
          onPress: async () => {
            try {
              await updateListingStatus(associatedListing.id, 'sold', otherParticipantId);
              Alert.alert("Success", "Listing marked as sold.");
            } catch (e: any) {
              Alert.alert("Error", e.message);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-100 shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View className="w-10 h-10 rounded-full bg-gold/20 justify-center items-center mr-3">
          <Text className="text-gold font-bold">{chatName.charAt(0)}</Text>
        </View>
        <TouchableOpacity 
          className="flex-1"
          onPress={() => setProfileModalVisible(true)}
        >
          <Text className="text-dark font-bold text-base" numberOfLines={1}>{chatName}</Text>
          <Text className="text-gold text-xs font-medium">{chatCompany}</Text>
        </TouchableOpacity>
      </View>



      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} 
        className="flex-1"
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          inverted={false}
          renderItem={({ item }) => {
            const isMe = item.senderId === user?.id;
            return (
              <View className={`mb-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                <View className={`p-3 rounded-2xl ${isMe ? 'bg-gold rounded-br-sm' : 'bg-white rounded-bl-sm border border-gray-100'}`}>
                  <Text className={isMe ? 'text-white' : 'text-dark'}>{item.text}</Text>
                </View>
                <Text className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </Text>
              </View>
            );
          }}
        />

        {/* Input Bar */}
        <View className="flex-row items-center bg-white p-3 border-t border-gray-100">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 min-h-[44px]">
            <TextInput
              className="flex-1 py-2"
              style={{ color: '#1A1A1A' }}
              placeholder={t('chat.typeMessage')}
              placeholderTextColor="#9CA3AF"
              multiline
              value={message}
              onChangeText={setMessage}
            />
          </View>
          <TouchableOpacity 
            className={`w-11 h-11 rounded-full justify-center items-center ml-2 ${message.trim() ? 'bg-gold' : 'bg-gray-200'}`}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Ionicons name="send" size={18} color="white" className="ml-1" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* User Profile Modal */}
      <Modal visible={profileModalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 h-1/2">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-dark">{t('profile.details', 'User Profile')}</Text>
              <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                <Ionicons name="close" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            <View className="items-center mb-6">
              <View className="w-24 h-24 rounded-full bg-gold/20 justify-center items-center mb-4">
                <Text className="text-gold font-bold text-3xl">{chatName.charAt(0).toUpperCase()}</Text>
              </View>
              <Text className="text-2xl font-bold text-dark">{chatName}</Text>
              <Text className="text-gray-500">{chatCompany}</Text>
              {(otherUser as any)?.city && (otherUser as any)?.state && (
                <Text className="text-gray-400 mt-1">{(otherUser as any)?.city}, {(otherUser as any)?.state}</Text>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

