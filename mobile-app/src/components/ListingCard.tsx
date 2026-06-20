import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface ListingCardProps {
  listing: any;
  onPress: () => void;
  isMyListing?: boolean;
  onEdit?: () => void;
  onMarkSold?: () => void;
  onDelete?: () => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({ 
  listing, 
  onPress, 
  isMyListing = false,
  onEdit,
  onMarkSold,
  onDelete
}) => {
  const { t, i18n } = useTranslation();
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      className="bg-white rounded-xl shadow-sm mb-4 border border-gray-100 overflow-hidden"
    >
      <View className="h-48 bg-gray-200 justify-center items-center">
        {(listing.images || listing.photos) && (listing.images || listing.photos).length > 0 ? (
          <Image source={{ uri: (listing.images || listing.photos)[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
        )}
      </View>
      
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <View className="bg-gold/10 px-2 py-1 rounded-md">
              <Text numberOfLines={1} className="text-gold text-xs font-semibold">
                {(() => {
                  const catName = typeof listing.category === 'object' ? (listing.category as any)?.name : listing.category;
                  const staticMap: any = {
                    'XRF Machines': t('categories.xrf'),
                    'Laser Marking': t('categories.laser'),
                    'Micro Balances': t('categories.micro'),
                    'Fire Assay Equipment': t('categories.fireAssay')
                  };
                  if (staticMap[catName] && staticMap[catName] !== catName) {
                    return staticMap[catName];
                  }
                  // For dynamically added categories, check listing's category object for translations
                  const lang = i18n.language;
                  const catObj = typeof listing.category === 'object' ? listing.category : null;
                  if (lang === 'hi' && catObj?.nameHi) return catObj.nameHi;
                  if (lang === 'gu' && catObj?.nameGu) return catObj.nameGu;
                  return catName;
                })()}
              </Text>
          </View>
          {isMyListing && (
            <View className={`px-2 py-1 rounded-md ${listing.status === 'Active' ? 'bg-green-100' : listing.status === 'Pending' ? 'bg-amber-100' : 'bg-gray-100'}`}>
               <Text className={`text-xs font-bold ${listing.status === 'Active' ? 'text-green-700' : listing.status === 'Pending' ? 'text-amber-700' : 'text-gray-700'}`}>
                 {listing.status}
               </Text>
            </View>
          )}
        </View>

        <Text className="text-lg font-bold text-dark mb-1">
          {listing.brand} {listing.model ? `- ${listing.model}` : ''}
        </Text>

        
        <View className="flex-row justify-between items-end mt-2">
          <View>
            <Text className="text-xl font-bold text-dark">₹{(listing.price || 0).toLocaleString('en-IN')}</Text>
            {(listing.pricingType === 'negotiable' || listing.isMakeOffer) && !isMyListing && (
              <Text className="text-gold text-xs font-semibold mt-1">Make an Offer</Text>
            )}
          </View>
          <View className="flex-row items-center">
            <Ionicons name="location-outline" size={14} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs ml-1">{[listing.city, listing.state].filter(Boolean).join(', ')}</Text>
          </View>
        </View>

        {isMyListing && (
          <View className="flex-row justify-end mt-4 pt-4 border-t border-gray-100 gap-x-4">
            <TouchableOpacity onPress={onEdit} className="p-2">
              <Ionicons name="pencil" size={20} color="#D4AF37" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onMarkSold} className="p-2">
              <Ionicons name="checkmark-circle" size={20} color={listing.status === 'Sold' ? '#9CA3AF' : '#10B981'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} className="p-2">
              <Ionicons name="trash" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
