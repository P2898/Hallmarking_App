import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation';
import { useDataStore } from '../../store/useDataStore';
import { ListingCard } from '../../components/ListingCard';

const CATEGORIES = ['All', 'XRF Machines', 'Laser Marking', 'Micro Balances', 'Fire Assay Equipment'];

export const HomeFeedScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const allListings = useDataStore(state => state.listings);
  const listings = allListings.filter(l => l.status === 'Active');
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredListings = listings.filter(l => {
    const matchesCategory = activeCategory === 'All' || l.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      l.category.toLowerCase().includes(searchLower) ||
      l.brand.toLowerCase().includes(searchLower) ||
      l.city.toLowerCase().includes(searchLower) ||
      l.state.toLowerCase().includes(searchLower);
      
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-white pt-4">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 mb-4">
        <Text className="text-2xl font-extrabold text-gold tracking-widest">HallmarkHub</Text>
        <View className="flex-row items-center gap-x-4">
          <View className="bg-gray-100 px-3 py-1 rounded-full">
            <Text className="font-bold text-dark">EN</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
            <View className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View className="mx-4 flex-row items-center bg-gray-100 rounded-xl px-4 py-2 mb-4">
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput 
          className="flex-1 ml-2 text-dark h-10"
          placeholder="Search machines, brands, cities..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <View className="mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          {CATEGORIES.map((cat, index) => (
            <TouchableOpacity 
              key={index}
              onPress={() => setActiveCategory(cat)}
              className={`mr-3 px-4 py-2 rounded-full ${activeCategory === cat ? 'bg-gold' : 'bg-gray-100'}`}
            >
              <Text className={`font-semibold ${activeCategory === cat ? 'text-white' : 'text-gray-600'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Feed */}
      <View className="flex-1 px-4">
        <Text className="text-xl font-bold text-dark mb-4">Available Equipment</Text>
        <FlatList
          data={filteredListings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListingCard 
              listing={item} 
              onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center py-20">
              <Ionicons name="search-outline" size={60} color="#D1D5DB" />
              <Text className="text-gray-500 text-lg mt-4 text-center">
                No results found for your search
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};
