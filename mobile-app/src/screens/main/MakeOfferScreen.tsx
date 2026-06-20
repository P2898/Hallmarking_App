import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MainStackParamList } from '../../types/navigation';
import { useListingsStore } from '../../store/listingsStore';
import { useChatStore } from '../../store/chatStore';
import { Button } from '../../components/Button';
import { Alert } from 'react-native';

export const MakeOfferScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MainStackParamList, 'MakeOffer'>>();
  const listingId = route.params?.id;
  
  const { activeListings, myListings } = useListingsStore();
  const allListings = [...activeListings, ...myListings];
  const listing = allListings.find(l => l.id === listingId);
  const { getOrCreateChat, createOffer } = useChatStore();
  const [loading, setLoading] = useState(false);
  
  const [offer, setOffer] = useState('');
  const [message, setMessage] = useState('');

  if (!listing) return null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark">Make an Offer</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View className="bg-gray-50 p-4 rounded-xl mb-6 flex-row items-center">
            <View className="w-16 h-16 bg-gray-200 rounded-lg justify-center items-center mr-4">
              <Ionicons name="camera-outline" size={24} color="#9CA3AF" />
            </View>
            <View className="flex-1">
              <Text className="text-dark font-bold mb-1" numberOfLines={1}>{listing.brand}</Text>
              <Text className="text-gray-500 text-sm mb-1">{typeof listing.category === 'object' ? listing.category?.name : listing.category}</Text>
              <Text className="text-gold font-bold">Listed: ₹{(listing.price || 0).toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <Text className="text-dark font-semibold mb-2">Your Offer (₹)</Text>
          <View className="flex-row items-center border border-gray-300 rounded-xl bg-white px-4 h-14 mb-6 focus:border-gold">
            <Text className="text-gray-500 font-bold mr-2 text-lg">₹</Text>
            <TextInput
              className="flex-1 h-full text-dark text-lg font-bold"
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={offer}
              onChangeText={setOffer}
            />
          </View>

          <Text className="text-dark font-semibold mb-2">Optional Message</Text>
          <View className="border border-gray-300 rounded-xl bg-white p-4 h-32 mb-8 focus:border-gold">
            <TextInput
              className="flex-1 text-dark"
              placeholder="Add a message to the seller..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />
          </View>

          <Button 
            title="Send Offer" 
            onPress={async () => {
              if (!offer || !listing) return;
              try {
                setLoading(true);
                const chatId = await getOrCreateChat(listing.userId, listing.id);
                await createOffer(chatId, parseFloat(offer), message);
                Alert.alert('Success', 'Your offer has been sent to the seller!');
                navigation.goBack();
              } catch (error: any) {
                Alert.alert('Error', error.message || 'Failed to send offer');
              } finally {
                setLoading(false);
              }
            }} 
            disabled={!offer}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
