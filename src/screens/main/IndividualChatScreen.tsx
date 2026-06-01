import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../types/navigation';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase.config';
import { useTranslation } from 'react-i18next';

export const IndividualChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MainStackParamList, 'IndividualChat'>>();
  const chatId = route.params?.id;
  
  const { chats, messages: allMessages, fetchMessages, sendMessage } = useChatStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const chat = chats.find(c => c.id === chatId);
  const messages = allMessages[chatId] || [];
  
  React.useEffect(() => {
    if (chatId) {
      const unsubscribe = fetchMessages(chatId);
      
      // Reset unread count if we are opening it and there are unread messages
      if (chat && chat.unreadCount > 0 && chat.lastSenderId !== user?.uid) {
        updateDoc(doc(db, 'chats', chatId), { unreadCount: 0 });
      }
      
      return () => unsubscribe();
    }
  }, [chatId, fetchMessages, chat?.unreadCount]);

  const [profile, setProfile] = useState<any>(null);
  React.useEffect(() => {
    if (!chat || !user) return;
    const otherId = chat.participants.find(p => p !== user.uid);
    if (otherId) {
      getDoc(doc(db, 'users', otherId)).then(snap => {
        if (snap.exists()) setProfile(snap.data());
      });
    }
  }, [chat, user]);

  const [message, setMessage] = useState('');

  const chatName = profile?.fullName || 'User';
  const chatCompany = profile?.companyName || 'Company';

  const handleSend = () => {
    if (message.trim() && chatId) {
      sendMessage(chatId, message.trim());
      setMessage('');
    }
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
        <View className="flex-1">
          <Text className="text-dark font-bold text-base" numberOfLines={1}>{chatName}</Text>
          <Text className="text-gold text-xs font-medium">{chatCompany}</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        className="flex-1"
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          inverted={false}
          renderItem={({ item }) => {
            const isMe = item.senderId === user?.uid;
            return (
              <View className={`mb-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                <View className={`p-3 rounded-2xl ${isMe ? 'bg-gold rounded-br-sm' : 'bg-white rounded-bl-sm border border-gray-100'}`}>
                  <Text className={isMe ? 'text-white' : 'text-dark'}>{item.text}</Text>
                </View>
                <Text className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                  {item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </Text>
              </View>
            );
          }}
        />

        {/* Input Bar */}
        <View className="flex-row items-center bg-white p-3 border-t border-gray-100">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 min-h-[44px]">
            <TextInput
              className="flex-1 text-dark py-2"
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
    </SafeAreaView>
  );
};
