import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Listing } from '../types/listing';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';

interface MarkSoldModalProps {
  visible: boolean;
  listing: Listing | null;
  onClose: () => void;
  onConfirm: (buyerId?: string) => void;
}

export const MarkSoldModal: React.FC<MarkSoldModalProps> = ({ visible, listing, onClose, onConfirm }) => {
  const { chats } = useChatStore();
  const { user } = useAuthStore();

  if (!listing || !visible) return null;

  // Extract unique buyers from all chats where the current user is a participant
  // We don't filter by listingId because users might chat about multiple listings in one thread
  // or the backend might have previously merged chats.
  const potentialBuyersMap = new Map<string, any>();
  
  chats.forEach((c) => {
    // If the current user is the seller in the chat, the other person is the buyer
    if (c.sellerId === user?.id || c.sellerId === (user as any)?.uid) {
      if (c.buyer && c.buyer.id) {
        potentialBuyersMap.set(c.buyer.id, c.buyer);
      }
    }
    // If the current user is the buyer in the chat, the other person is the seller
    else if (c.buyerId === user?.id || c.buyerId === (user as any)?.uid) {
      if (c.seller && c.seller.id) {
        potentialBuyersMap.set(c.seller.id, c.seller);
      }
    }
  });

  const potentialBuyers = Array.from(potentialBuyersMap.values());

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 min-h-[50%] max-h-[80%]">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-bold text-dark">Mark as Sold</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          <Text className="text-gray-600 mb-4 text-base">
            Who did you sell "{listing.title}" to?
          </Text>

          {potentialBuyers.length > 0 ? (
            <FlatList
              data={potentialBuyers}
              keyExtractor={(item) => item!.id}
              className="mb-4"
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center p-4 border border-gray-200 rounded-xl mb-3 bg-gray-50"
                  onPress={() => onConfirm(item!.id)}
                >
                  <View className="w-12 h-12 rounded-full bg-gold/20 justify-center items-center mr-4">
                    <Text className="text-gold font-bold text-lg">
                      {item!.displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-dark font-bold text-base">{item!.displayName}</Text>
                    {!!(item as any).companyName && (
                      <Text className="text-gray-500 text-sm">{(item as any).companyName}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View className="bg-gray-50 p-4 rounded-xl mb-4 items-center">
              <Text className="text-gray-500 text-center">
                You haven't chatted with anyone on the app about this listing yet.
              </Text>
            </View>
          )}

          <TouchableOpacity
            className="flex-row items-center p-4 border border-gray-200 rounded-xl mb-6 bg-white"
            onPress={() => onConfirm()}
          >
            <View className="w-12 h-12 rounded-full bg-gray-100 justify-center items-center mr-4">
              <Ionicons name="person-outline" size={20} color="#6B7280" />
            </View>
            <View className="flex-1">
              <Text className="text-dark font-bold text-base">Someone else</Text>
              <Text className="text-gray-500 text-sm">Sold off-platform</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
