import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation';
import { useDataStore } from '../../store/useDataStore';

export const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const chats = useDataStore(state => state.chats);
  const [search, setSearch] = useState('');

  const filteredChats = chats.filter(c => 
    c.buyerName.toLowerCase().includes(search.toLowerCase()) || 
    c.buyerCompany.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-white pt-4">
      <View className="px-4 mb-4">
        <Text className="text-2xl font-bold text-dark mb-4">Messages</Text>
        
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput 
            placeholder="Search conversations..." 
            className="flex-1 ml-2 text-dark h-10"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="flex-row items-center px-4 py-4 border-b border-gray-100"
            onPress={() => navigation.navigate('IndividualChat', { id: item.id })}
          >
            <View className="w-12 h-12 rounded-full bg-gold/20 justify-center items-center mr-3">
              <Text className="text-gold font-bold text-lg">
                {item.buyerName.charAt(0)}
              </Text>
            </View>
            
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="font-bold text-dark text-base">{item.buyerName}</Text>
                <Text className="text-xs text-gray-400">{item.timestamp}</Text>
              </View>
              <Text className="text-xs text-gold font-semibold mb-1">{item.buyerCompany}</Text>
              <Text className="text-gray-500 text-sm" numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            
            {item.unreadCount > 0 && (
              <View className="bg-gold w-6 h-6 rounded-full justify-center items-center ml-2">
                <Text className="text-white text-xs font-bold">{item.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="chatbubbles-outline" size={60} color="#D1D5DB" />
            <Text className="text-gray-400 text-lg mt-4">No conversations yet</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};
