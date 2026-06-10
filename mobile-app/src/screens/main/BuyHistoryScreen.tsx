import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation';
import { useListingsStore } from '../../store/listingsStore';
import { ListingCard } from '../../components/ListingCard';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

export const BuyHistoryScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { buyHistory, fetchBuyHistory } = useListingsStore();
  const { t } = useTranslation();

  React.useEffect(() => {
    const unsubscribe = fetchBuyHistory();
    return () => unsubscribe();
  }, [fetchBuyHistory]);

  return (
    <SafeAreaView className="flex-1 bg-white pt-4">
      <View className="flex-row items-center px-4 mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-dark">{t('profile.buyHistory', 'Buy History')}</Text>
      </View>

      <FlatList
        data={buyHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <ListingCard 
            listing={item} 
            isMyListing={false}
            onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
          />
        )}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-20">
            <Ionicons name="cart-outline" size={64} color="#D1D5DB" className="mb-4" />
            <Text className="text-gray-400 text-lg">
              {t('buyHistory.empty', 'No buy history yet.')}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};
