import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      className="bg-white rounded-xl shadow-sm mb-4 border border-gray-100 overflow-hidden"
    >
      <View className="h-48 bg-gray-200 justify-center items-center">
        {listing.photos && listing.photos.length > 0 ? (
          <Image source={{ uri: listing.photos[0] }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        ) : (
          <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
        )}
      </View>
      
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <View className="bg-gold/10 px-2 py-1 rounded-md">
            <Text className="text-gold text-xs font-bold">{listing.category}</Text>
          </View>
          {isMyListing && (
            <View className={`px-2 py-1 rounded-md ${listing.status === 'Active' ? 'bg-green-100' : listing.status === 'Pending' ? 'bg-amber-100' : 'bg-gray-100'}`}>
               <Text className={`text-xs font-bold ${listing.status === 'Active' ? 'text-green-700' : listing.status === 'Pending' ? 'text-amber-700' : 'text-gray-700'}`}>
                 {listing.status}
               </Text>
            </View>
          )}
        </View>

        <Text className="text-lg font-bold text-dark mb-1">{listing.brand}</Text>
        <Text className="text-gray-500 text-sm mb-2">{listing.yearOfPurchase || listing.year} • {listing.condition}</Text>
        
        <View className="flex-row justify-between items-end mt-2">
          <View>
            <Text className="text-xl font-bold text-dark">₹{(listing.price || 0).toLocaleString('en-IN')}</Text>
            {(listing.pricingType === 'negotiable' || listing.isMakeOffer) && !isMyListing && (
              <Text className="text-gold text-xs font-semibold mt-1">Make an Offer</Text>
            )}
          </View>
          <Text className="text-gray-400 text-xs">{listing.city}, {listing.state}</Text>
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
