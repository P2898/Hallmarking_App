import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation';
import { useListingsStore } from '../../store/listingsStore';
import { ListingCard } from '../../components/ListingCard';
import { MarkSoldModal } from '../../components/MarkSoldModal';
import { Listing } from '../../types/listing';
import { Button } from '../../components/Button';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

export const MyListingsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { myListings, loadingMy, fetchMyListings, updateListingStatus, deleteListing } = useListingsStore();
  const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');
  const [soldModalVisible, setSoldModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const { t } = useTranslation();

  React.useEffect(() => {
    const unsubscribe = fetchMyListings();
    return () => unsubscribe();
  }, [fetchMyListings]);

  const displayedListings = myListings.filter(l => l.status === activeTab);

  return (
    <SafeAreaView className="flex-1 bg-white pt-4">
      <View className="px-4 mb-4">
        <Text className="text-2xl font-bold text-dark mb-4">{t('myListings.title')}</Text>
        <Button 
          title={t('myListings.createNew')} 
          onPress={() => navigation.navigate('CreateListing')} 
        />
      </View>

      <View className="flex-row border-b border-gray-200 mb-4 px-4">
        {['active', 'sold'].map((tab) => (
          <TouchableOpacity 
            key={tab}
            onPress={() => setActiveTab(tab as any)}
            className={`flex-1 py-3 items-center ${activeTab === tab ? 'border-b-2 border-gold' : ''}`}
          >
            <Text className={`font-semibold capitalize ${activeTab === tab ? 'text-gold' : 'text-gray-500'}`}>
              {t(`myListings.${tab}`)}
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
            onEdit={() => navigation.navigate('EditListing', { id: item.id })}
            onMarkSold={() => {
              setSelectedListing(item);
              setSoldModalVisible(true);
            }}
            onDelete={() => deleteListing(item.id)}
          />
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-400 text-lg">
              {t('myListings.noListings').replace('{{status}}', t(`myListings.${activeTab}`))}
            </Text>
          </View>
        )}
      />
      <MarkSoldModal
        visible={soldModalVisible}
        listing={selectedListing}
        onClose={() => setSoldModalVisible(false)}
        onConfirm={async (buyerId) => {
          if (selectedListing) {
            await updateListingStatus(selectedListing.id, 'sold', buyerId);
          }
          setSoldModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};
