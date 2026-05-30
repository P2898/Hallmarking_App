import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../types/navigation';
import { useDataStore } from '../../store/useDataStore';

export const IndividualChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MainStackParamList, 'IndividualChat'>>();
  const chatId = route.params?.id;
  
  const { chats, sendMessage } = useDataStore();
  const chat = chats.find(c => c.id === chatId);
  
  const [message, setMessage] = useState('');

  // Use mock data if new chat
  const chatName = chat?.buyerName || 'Contact Name';
  const chatCompany = chat?.buyerCompany || 'Company Name';
  const messages = chat?.messages || [
    { id: '1', text: 'Hello, is this still available?', senderId: 'me', timestamp: '10:00 AM' }
  ];

  const handleSend = () => {
    if (message.trim() && chat) {
      sendMessage(chat.id, message.trim());
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
            const isMe = item.senderId === '1' || item.senderId === 'me';
            return (
              <View className={`mb-4 max-w-[80%] ${isMe ? 'self-end' : 'self-start'}`}>
                <View className={`p-3 rounded-2xl ${isMe ? 'bg-gold rounded-br-sm' : 'bg-white rounded-bl-sm border border-gray-100'}`}>
                  <Text className={isMe ? 'text-white' : 'text-dark'}>{item.text}</Text>
                </View>
                <Text className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                  {item.timestamp}
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
              placeholder="Type a message..."
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
