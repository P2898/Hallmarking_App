import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';

export const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { chats, loadingChats, fetchChats } = useChatStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    const unsubscribe = fetchChats();
    return () => unsubscribe();
  }, [fetchChats]);

  const filteredChats = (() => {
    const seenUsers = new Set<string>();
    return chats.filter(c => {
      const otherUser = c.buyerId === user?.id ? c.seller : c.buyer;
      if (!otherUser) return false;

      // Group by user so we only show the latest chat per person
      if (seenUsers.has(otherUser.id)) return false;
      seenUsers.add(otherUser.id);

      const displayName = otherUser.displayName || 'User';
      const nameMatch = displayName.toLowerCase().includes(search.toLowerCase());
      const listingTitle = c.listing?.title || '';
      const listingMatch = listingTitle.toLowerCase().includes(search.toLowerCase());
      return nameMatch || listingMatch;
    });
  })();

  return (
    <SafeAreaView className="flex-1 bg-white pt-4">
      <View className="px-4 mb-4">
        <Text className="text-2xl font-bold text-dark mb-4">{t('chat.messages')}</Text>
        
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput 
            placeholder={t('chat.search')} 
            className="flex-1 ml-2 text-dark h-10"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const otherUser = item.buyerId === user?.id ? item.seller : item.buyer;
          const chatTitle = otherUser?.displayName || 'User';
          const avatarLetter = chatTitle.charAt(0).toUpperCase();

          return (
            <TouchableOpacity 
              className="flex-row items-center px-4 py-4 border-b border-gray-100"
              onPress={() => navigation.navigate('IndividualChat', { id: item.id })}
            >
              <View className="w-12 h-12 rounded-full bg-gold/20 justify-center items-center mr-3">
                <Text className="text-gold font-bold text-lg">
                  {avatarLetter}
                </Text>
              </View>
              
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="font-bold text-dark text-base">{chatTitle}</Text>
                  <Text className="text-xs text-gray-400">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                  </Text>
                </View>
                <Text className="text-gray-500 text-sm" numberOfLines={1}>
                  {item.lastMessage || t('chat.noMessages')}
                </Text>
              </View>
              
              {item.unreadCount > 0 && item.lastSenderId !== user?.id && (
                <View className="bg-gold w-6 h-6 rounded-full justify-center items-center ml-2">
                  <Text className="text-white text-xs font-bold">{item.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="chatbubbles-outline" size={60} color="#D1D5DB" />
            <Text className="text-gray-400 text-lg mt-4">{t('chat.noConversations')}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

