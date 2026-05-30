import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation';
import { useDataStore } from '../../store/useDataStore';
import { ListingCard } from '../../components/ListingCard';
import { Button } from '../../components/Button';
import { TouchableOpacity } from 'react-native';

export const MyListingsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { listings, markAsSold, deleteListing } = useDataStore();
  const [activeTab, setActiveTab] = useState<'Active' | 'Pending' | 'Sold'>('Active');

  const myUserListings = listings.filter(l => l.sellerId === '1'); // Assuming '1' is the current mock user ID
  const displayedListings = myUserListings.filter(l => l.status === activeTab);

  return (
    <SafeAreaView className="flex-1 bg-white pt-4">
      <View className="px-4 mb-4">
        <Text className="text-2xl font-bold text-dark mb-4">My Listings</Text>
        <Button 
          title="Create New Listing" 
          onPress={() => navigation.navigate('CreateListing')} 
        />
      </View>

      <View className="flex-row border-b border-gray-200 mb-4 px-4">
        {['Active', 'Pending', 'Sold'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            onPress={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 items-center ${activeTab === tab ? 'border-b-2 border-gold' : ''}`}
          >
            <Text className={`font-semibold ${activeTab === tab ? 'text-gold' : 'text-gray-500'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={displayedListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <ListingCard 
            listing={item} 
            isMyListing
            onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
            onEdit={() => {}} // Mock
            onMarkSold={() => markAsSold(item.id)}
            onDelete={() => deleteListing(item.id)}
          />
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-400 text-lg">No {activeTab.toLowerCase()} listings found.</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};
