import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation';
import { useListingsStore } from '../../store/listingsStore';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

export const ListingDetailScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainStackParamList, 'ListingDetail'>>();
  const listingId = route.params?.id;
  
  const { activeListings, myListings, deleteListing } = useListingsStore();
  const { getOrCreateChat } = useChatStore();
  const { user } = useAuthStore();
  const allListings = [...activeListings, ...myListings];
  const listing = allListings.find(l => l.id === listingId);
  const [activeImage, setActiveImage] = useState(0);
  const [startingChat, setStartingChat] = useState(false);
  const { t } = useTranslation();

  if (!listing) return null;

  const handleStartChat = async () => {
    try {
      setStartingChat(true);
      const newChatId = await getOrCreateChat(listing.userId, listing.id);
      navigation.navigate('IndividualChat', { id: newChatId });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not start chat');
    } finally {
      setStartingChat(false);
    }
  };

  const screenWidth = Dimensions.get('window').width;
  const photos = listing.photos && listing.photos.length > 0 
    ? listing.photos 
    : ['https://placehold.co/600x400/D4AF37/ffffff.png?text=No+Photo'];

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
          <Text className="text-gray-500 text-base mb-4">{listing.yearOfPurchase || listing.year} • {listing.condition}</Text>
          
          <Text className="text-3xl font-black text-dark mb-6">₹{(listing.price || 0).toLocaleString('en-IN')}</Text>

          {user?.uid !== listing.userId && (
            <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 12 }} className="mb-6 -mx-4">
              {(listing.pricingType === 'negotiable' || listing.isMakeOffer) && (
                <View className="flex-1">
                  <Button 
                    title={t('listing.makeOffer')} 
                    variant="outline" 
                    onPress={() => navigation.navigate('MakeOffer', { id: listing.id })}
                  />
                </View>
              )}
              <View className="flex-1">
                <Button 
                  title={t('listing.chatWithSeller')} 
                  variant="primary" 
                  loading={startingChat}
                  onPress={handleStartChat}
                />
              </View>
            </View>
          )}



          <View className="border-t border-gray-100 pt-6 mb-6">
            <Text className="text-xl font-bold text-dark mb-3">{t('listing.description')}</Text>
            <Text className="text-gray-600 leading-6">
              {listing.description || t('listing.noDescription')}
            </Text>
          </View>

          <View className="border-t border-gray-100 pt-6 mb-8">
            <Text className="text-xl font-bold text-dark mb-3">{t('listing.specifications')}</Text>
            <View className="flex-row py-2 border-b border-gray-50">
              <Text className="flex-1 text-gray-500 font-medium">{t('listing.category')}</Text>
              <Text className="flex-1 text-dark font-semibold">{listing.category}</Text>
            </View>
            <View className="flex-row py-2 border-b border-gray-50">
              <Text className="flex-1 text-gray-500 font-medium">{t('listing.brand')}</Text>
              <Text className="flex-1 text-dark font-semibold">{listing.brand}</Text>
            </View>
            <View className="flex-row py-2 border-b border-gray-50">
              <Text className="flex-1 text-gray-500 font-medium">{t('listing.yearOfPurchase')}</Text>
              <Text className="flex-1 text-dark font-semibold">{listing.yearOfPurchase || listing.year}</Text>
            </View>
            <View className="flex-row py-2 border-b border-gray-50">
              <Text className="flex-1 text-gray-500 font-medium">{t('listing.condition')}</Text>
              <Text className="flex-1 text-dark font-semibold">{listing.condition}</Text>
            </View>
            {!!listing.warranty && (
              <View className="flex-row py-2">
                <Text className="flex-1 text-gray-500 font-medium">{t('listing.warranty')}</Text>
                <Text className="flex-1 text-dark font-semibold">{listing.warranty}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity className="items-center">
            <Text className="text-gray-400 font-medium underline">{t('listing.report')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
