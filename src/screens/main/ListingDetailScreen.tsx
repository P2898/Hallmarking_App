import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation';
import { useDataStore } from '../../store/useDataStore';
import { Button } from '../../components/Button';

export const ListingDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainStackParamList, 'ListingDetail'>>();
  const listingId = route.params?.id;
  
  const listing = useDataStore(state => state.listings.find(l => l.id === listingId));
  const [activeImage, setActiveImage] = useState(0);

  if (!listing) return null;

  const screenWidth = Dimensions.get('window').width;
  const photos = [
    'https://placehold.co/600x400/D4AF37/ffffff.png?text=Photo+1',
    'https://placehold.co/600x400/1A1A1A/ffffff.png?text=Photo+2',
    'https://placehold.co/600x400/9CA3AF/ffffff.png?text=Photo+3'
  ];

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveImage(Math.round(index));
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 absolute top-10 z-10 w-full justify-between">
        <TouchableOpacity 
          className="w-10 h-10 rounded-full bg-white/80 justify-center items-center shadow-sm"
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Mock Image Gallery */}
        <View>
          <FlatList
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            decelerationRate="fast"
            keyExtractor={(_, index) => index.toString()}
            onScroll={handleScroll}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={{ width: screenWidth, height: 280 }}
                resizeMode="cover"
              />
            )}
          />
          {photos.length > 1 && (
            <View className="absolute bottom-4 w-full flex-row justify-center gap-x-2">
              {photos.map((_, i) => (
                <View 
                  key={i} 
                  className={`w-2 h-2 rounded-full ${activeImage === i ? 'bg-[#D4AF37]' : 'bg-gray-300'}`} 
                />
              ))}
            </View>
          )}
        </View>

        <View className="p-4">
          <View className="flex-row justify-between items-start mb-3">
            <View className="bg-gold/10 px-3 py-1.5 rounded-md">
              <Text className="text-gold text-sm font-bold">{listing.category}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="location" size={16} color="#9CA3AF" />
              <Text className="text-gray-500 ml-1">{listing.city}, {listing.state}</Text>
            </View>
          </View>

          <Text className="text-2xl font-extrabold text-dark mb-1">{listing.brand}</Text>
          <Text className="text-gray-500 text-base mb-4">{listing.year} • {listing.condition}</Text>
          
          <Text className="text-3xl font-black text-dark mb-6">₹{listing.price.toLocaleString('en-IN')}</Text>

          <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 12 }} className="mb-6 -mx-4">
            {listing.isMakeOffer && (
              <View className="flex-1">
                <Button 
                  title="Make an Offer" 
                  variant="outline" 
                  onPress={() => navigation.navigate('MakeOffer', { id: listing.id })}
                />
              </View>
            )}
            <View className="flex-1">
              <Button 
                title="Chat with Seller" 
                variant="primary" 
                onPress={() => navigation.navigate('IndividualChat', { id: 'mock-new-chat' })}
              />
            </View>
          </View>

          <View className="border-t border-gray-100 pt-6 mb-6">
            <Text className="text-xl font-bold text-dark mb-3">Description</Text>
            <Text className="text-gray-600 leading-6">
              {listing.description || 'No description provided for this listing. Please contact the seller for more details.'}
            </Text>
          </View>

          <View className="border-t border-gray-100 pt-6 mb-8">
            <Text className="text-xl font-bold text-dark mb-3">Specifications</Text>
            <View className="flex-row py-2 border-b border-gray-50">
              <Text className="flex-1 text-gray-500 font-medium">Category</Text>
              <Text className="flex-1 text-dark font-semibold">{listing.category}</Text>
            </View>
            <View className="flex-row py-2 border-b border-gray-50">
              <Text className="flex-1 text-gray-500 font-medium">Brand</Text>
              <Text className="flex-1 text-dark font-semibold">{listing.brand}</Text>
            </View>
            <View className="flex-row py-2 border-b border-gray-50">
              <Text className="flex-1 text-gray-500 font-medium">Year of Purchase</Text>
              <Text className="flex-1 text-dark font-semibold">{listing.year}</Text>
            </View>
            <View className="flex-row py-2">
              <Text className="flex-1 text-gray-500 font-medium">Condition</Text>
              <Text className="flex-1 text-dark font-semibold">{listing.condition}</Text>
            </View>
          </View>

          <TouchableOpacity className="items-center">
            <Text className="text-gray-400 font-medium underline">Report this listing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
