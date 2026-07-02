import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, TextInput, Modal, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation';
import { useListingsStore } from '../../store/listingsStore';
import { useDataStore } from '../../store/useDataStore';
import { useAuthStore } from '../../store/authStore';
import { useCategoriesStore } from '../../store/categoriesStore';
import { ListingCard } from '../../components/ListingCard';
import { MarkSoldModal } from '../../components/MarkSoldModal';
import { Listing } from '../../types/listing';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';


export const HomeFeedScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { activeListings: listings, loadingActive, error, fetchActiveListings, deleteListing } = useListingsStore();
  const { notifications } = useDataStore();
  const { user } = useAuthStore();
  const { categories, subscribeToCategories } = useCategoriesStore();
  const { t, i18n } = useTranslation();
  
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [catDropdownVisible, setCatDropdownVisible] = useState(false);
  const [cityDropdownVisible, setCityDropdownVisible] = useState(false);
  const [soldModalVisible, setSoldModalVisible] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  React.useEffect(() => {
    const unsubscribe = fetchActiveListings();
    const unsubCats = subscribeToCategories();
    return () => { unsubscribe(); unsubCats(); };
  }, [fetchActiveListings, subscribeToCategories]);
  
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeCity, setActiveCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Derive unique sorted cities from listings
  const availableCities = React.useMemo(() => {
    const citySet = new Set<string>();
    listings.forEach(l => { if (l.city && l.city.trim()) citySet.add(l.city.trim()); });
    return Array.from(citySet).sort();
  }, [listings]);

  const filteredListings = listings.filter(l => {
    const categoryName = typeof l.category === 'object' ? (l.category as any)?.name : l.category;
    const matchesCategory = activeCategory === 'All' || categoryName === activeCategory;
    const matchesCity = activeCity === 'All' || (l.city && l.city.trim().toLowerCase() === activeCity.toLowerCase());
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (categoryName && typeof categoryName === 'string' && categoryName.toLowerCase().includes(searchLower)) ||
      (l.title && l.title.toLowerCase().includes(searchLower)) ||
      (l.brand && l.brand.toLowerCase().includes(searchLower)) ||
      (l.model && l.model.toLowerCase().includes(searchLower)) ||
      (l.description && l.description.toLowerCase().includes(searchLower)) ||
      (l.city && l.city.toLowerCase().includes(searchLower)) ||
      (l.state && l.state.toLowerCase().includes(searchLower)) ||
      (l.country && l.country.toLowerCase().includes(searchLower));
      
    return matchesCategory && matchesCity && matchesSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-white pt-4">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 mb-4">
        <View className="w-12 h-12 rounded-full overflow-hidden justify-center items-center">
          <Image 
            source={require('../../../assets/logo_circle.png')} 
            style={{ height: '100%', width: '100%' }} 
            resizeMode="cover" 
          />
        </View>
        <View className="flex-row items-center gap-x-4">
          <TouchableOpacity 
            className="bg-gray-100 px-3 py-1 rounded-full"
            onPress={() => setLangModalVisible(true)}
          >
            <Text className="font-bold text-dark">{i18n.language.toUpperCase()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={24} color="#1A1A1A" />
            {unreadCount > 0 && (
              <View className="absolute -top-2 -right-2 bg-red-500 rounded-full border-2 border-white min-w-[18px] h-[18px] justify-center items-center px-1">
                <Text className="text-white text-[10px] font-bold">{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View className="mx-4 flex-row items-center bg-gray-100 rounded-xl px-4 min-h-[48px] mb-4">
        <Ionicons name="search" size={20} color="#9CA3AF" />
        <TextInput 
          className="flex-1 ml-2 py-3"
          style={{ color: '#1A1A1A', includeFontPadding: false, textAlignVertical: 'center' }}
          placeholder={t('common.search')}
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} className="p-2">
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category + City Dropdowns Row */}
      <View className="mx-4 mb-4 flex-row gap-x-2">
        {/* Category Dropdown */}
        <TouchableOpacity
          onPress={() => setCatDropdownVisible(true)}
          className="flex-1 flex-row items-center justify-between bg-gray-100 rounded-xl px-3 min-h-[48px]"
        >
          <Text style={{ color: '#1A1A1A' }} className="font-semibold text-sm flex-1" numberOfLines={1}>
            {activeCategory === 'All' ? t('categories.all') : (() => {
              const cat = categories.find(c => c.name === activeCategory);
              if (!cat) return activeCategory;
              const staticMap: any = {
                'XRF Machines': t('categories.xrf'),
                'Laser Marking': t('categories.laser'),
                'Micro Balances': t('categories.micro'),
                'Fire Assay Equipment': t('categories.fireAssay')
              };
              if (staticMap[cat.name] && staticMap[cat.name] !== cat.name) return staticMap[cat.name];
              const lang = i18n.language;
              if (lang === 'hi' && cat.nameHi) return cat.nameHi;
              if (lang === 'gu' && cat.nameGu) return cat.nameGu;
              return cat.name;
            })()}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
        </TouchableOpacity>

        {/* City Dropdown */}
        <TouchableOpacity
          onPress={() => setCityDropdownVisible(true)}
          className="flex-1 flex-row items-center justify-between bg-gray-100 rounded-xl px-3 min-h-[48px]"
        >
          <Text style={{ color: '#1A1A1A' }} className="font-semibold text-sm flex-1" numberOfLines={1}>
            {activeCity === 'All' ? 'All Cities' : activeCity}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Category Dropdown Modal */}
      <Modal visible={catDropdownVisible} transparent animationType="fade" onRequestClose={() => setCatDropdownVisible(false)}>
        <Pressable className="flex-1 bg-black/50 justify-center items-center" onPress={() => setCatDropdownVisible(false)}>
          <View className="bg-white w-4/5 rounded-2xl p-4 shadow-lg">
            <Text className="text-lg font-bold text-dark mb-4 text-center">Select Category</Text>
            <TouchableOpacity
              className={`p-4 rounded-xl mb-2 ${activeCategory === 'All' ? 'bg-gold/10 border border-gold' : 'bg-gray-50'}`}
              onPress={() => { setActiveCategory('All'); setCatDropdownVisible(false); }}
            >
              <Text className={`text-center font-bold ${activeCategory === 'All' ? 'text-gold' : 'text-dark'}`}>{t('categories.all')}</Text>
            </TouchableOpacity>
            {categories.map((cat) => {
              const staticMap: any = {
                'XRF Machines': t('categories.xrf'),
                'Laser Marking': t('categories.laser'),
                'Micro Balances': t('categories.micro'),
                'Fire Assay Equipment': t('categories.fireAssay')
              };
              let label = cat.name;
              if (staticMap[cat.name] && staticMap[cat.name] !== cat.name) label = staticMap[cat.name];
              else if (i18n.language === 'hi' && cat.nameHi) label = cat.nameHi;
              else if (i18n.language === 'gu' && cat.nameGu) label = cat.nameGu;
              return (
                <TouchableOpacity
                  key={cat.id}
                  className={`p-4 rounded-xl mb-2 ${activeCategory === cat.name ? 'bg-gold/10 border border-gold' : 'bg-gray-50'}`}
                  onPress={() => { setActiveCategory(cat.name); setCatDropdownVisible(false); }}
                >
                  <Text className={`text-center font-bold ${activeCategory === cat.name ? 'text-gold' : 'text-dark'}`}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>

      {/* City Dropdown Modal */}
      <Modal visible={cityDropdownVisible} transparent animationType="fade" onRequestClose={() => setCityDropdownVisible(false)}>
        <Pressable className="flex-1 bg-black/50 justify-center items-center" onPress={() => setCityDropdownVisible(false)}>
          <View className="bg-white w-4/5 rounded-2xl p-4 shadow-lg" style={{ maxHeight: '70%' }}>
            <Text className="text-lg font-bold text-dark mb-4 text-center">Select City</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                className={`p-4 rounded-xl mb-2 ${activeCity === 'All' ? 'bg-gold/10 border border-gold' : 'bg-gray-50'}`}
                onPress={() => { setActiveCity('All'); setCityDropdownVisible(false); }}
              >
                <Text className={`text-center font-bold ${activeCity === 'All' ? 'text-gold' : 'text-dark'}`}>All Cities</Text>
              </TouchableOpacity>
              {availableCities.map((city) => (
                <TouchableOpacity
                  key={city}
                  className={`p-4 rounded-xl mb-2 ${activeCity === city ? 'bg-gold/10 border border-gold' : 'bg-gray-50'}`}
                  onPress={() => { setActiveCity(city); setCityDropdownVisible(false); }}
                >
                  <Text className={`text-center font-bold ${activeCity === city ? 'text-gold' : 'text-dark'}`}>{city}</Text>
                </TouchableOpacity>
              ))}
              {availableCities.length === 0 && (
                <Text className="text-center text-gray-400 py-4">No cities found</Text>
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Feed */}
      <View className="flex-1 px-4">
        <Text className="text-xl font-bold text-dark mb-4">{t('home.availableEquipment')}</Text>
        {loadingActive ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Loading listings...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-red-500 mb-4">{error}</Text>
            <TouchableOpacity onPress={fetchActiveListings} className="bg-gold px-4 py-2 rounded-lg">
              <Text className="text-white font-bold">{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
        <FlatList
          data={filteredListings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ListingCard 
              listing={item} 
              isMyListing={user && (user.id || user.uid) === (item.sellerId || item.userId)}
              onPress={() => navigation.navigate('ListingDetail', { id: item.id })}
              onEdit={() => navigation.navigate('EditListing', { id: item.id })}
              onMarkSold={() => {
                setSelectedListing(item);
                setSoldModalVisible(true);
              }}
              onDelete={() => {
                Alert.alert('Delete Listing', 'Are you sure you want to permanently delete this equipment?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: async () => {
                    await deleteListing(item.id);
                  }}
                ]);
              }}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
          ListEmptyComponent={() => (
            <View className="flex-1 justify-center items-center py-20">
              <Ionicons name="search-outline" size={60} color="#D1D5DB" />
              <Text className="text-gray-500 text-lg mt-4 text-center">
                {t('home.noResults')}
              </Text>
            </View>
          )}
        />
        )}
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={langModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable 
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setLangModalVisible(false)}
        >
          <View className="bg-white w-4/5 rounded-2xl p-4 shadow-lg">
            <Text className="text-lg font-bold text-dark mb-4 text-center">Select Language</Text>
            
            <TouchableOpacity 
              className={`p-4 rounded-xl mb-2 ${i18n.language === 'en' ? 'bg-gold/10 border border-gold' : 'bg-gray-50'}`}
              onPress={() => { i18n.changeLanguage('en'); setLangModalVisible(false); }}
            >
              <Text className={`text-center font-bold ${i18n.language === 'en' ? 'text-gold' : 'text-dark'}`}>English (EN)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`p-4 rounded-xl mb-2 ${i18n.language === 'hi' ? 'bg-gold/10 border border-gold' : 'bg-gray-50'}`}
              onPress={() => { i18n.changeLanguage('hi'); setLangModalVisible(false); }}
            >
              <Text className={`text-center font-bold ${i18n.language === 'hi' ? 'text-gold' : 'text-dark'}`}>हिंदी (HI)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className={`p-4 rounded-xl ${i18n.language === 'gu' ? 'bg-gold/10 border border-gold' : 'bg-gray-50'}`}
              onPress={() => { i18n.changeLanguage('gu'); setLangModalVisible(false); }}
            >
              <Text className={`text-center font-bold ${i18n.language === 'gu' ? 'text-gold' : 'text-dark'}`}>ગુજરાતી (GU)</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <MarkSoldModal
        visible={soldModalVisible}
        listing={selectedListing}
        onClose={() => setSoldModalVisible(false)}
        onConfirm={async (buyerId) => {
          if (selectedListing) {
            try {
              await useListingsStore.getState().updateListingStatus(selectedListing.id, 'sold', buyerId);
            } catch (error) {
              console.error('Failed to mark sold', error);
            }
          }
          setSoldModalVisible(false);
        }}
      />
    </SafeAreaView>
  );
};
