import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDataStore, AppNotification } from '../../store/useDataStore';

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { notifications, markNotificationRead } = useDataStore();

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'chat': return { name: 'chatbubble', color: '#D4AF37' }; // Gold
      case 'offer': return { name: 'pricetag', color: '#8B5CF6' }; // Purple
      case 'approved': return { name: 'checkmark-circle', color: '#10B981' }; // Green
      case 'rejected': return { name: 'close-circle', color: '#EF4444' }; // Red
      case 'match': return { name: 'notifications', color: '#3B82F6' }; // Blue
      case 'announcement': return { name: 'megaphone', color: '#F59E0B' }; // Amber
      default: return { name: 'notifications', color: '#9CA3AF' };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark">Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const icon = getIcon(item.type);
          return (
            <TouchableOpacity 
              className={`flex-row items-start px-4 py-4 border-b border-gray-100 ${!item.isRead ? 'bg-gold/5' : 'bg-white'}`}
              onPress={() => markNotificationRead(item.id)}
            >
              {!item.isRead && (
                <View className="absolute left-0 top-0 bottom-0 w-1 bg-gold" />
              )}
              <View className={`w-10 h-10 rounded-full justify-center items-center mr-3`} style={{ backgroundColor: `${icon.color}20` }}>
                <Ionicons name={icon.name as any} size={20} color={icon.color} />
              </View>
              <View className="flex-1">
                <Text className={`font-bold text-dark mb-1 ${!item.isRead ? 'text-base' : ''}`}>{item.title}</Text>
                <Text className="text-gray-600 mb-2 leading-5">{item.message}</Text>
                <Text className="text-xs text-gray-400 font-medium">{item.timestamp}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-32">
            <Ionicons name="notifications-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-400 text-lg mt-4 font-medium">No notifications yet</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};
