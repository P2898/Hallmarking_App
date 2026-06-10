import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { userProfile, logout } = useAuthStore();
  const { t } = useTranslation();

  // Map Firestore profile fields to display values
  const user = {
    fullName: userProfile?.fullName ?? 'User',
    companyName: userProfile?.companyName ?? '',
    email: userProfile?.email ?? '',
    city: userProfile?.city ?? '',
    state: userProfile?.state ?? '',
    status: userProfile?.status ?? 'pending',
    userType: userProfile?.userType ?? '',
  };

  const menuItems = [
    { title: t('profile.editProfile'), icon: 'person-outline', onPress: () => navigation.navigate('EditProfile') },
    { title: t('profile.myListings'), icon: 'list-outline', onPress: () => navigation.navigate('Tabs', { screen: 'MyListings' } as any) },
    { title: t('profile.buyHistory', 'Buy History'), icon: 'cart-outline', onPress: () => navigation.navigate('BuyHistory') },
    { title: t('profile.language'), icon: 'language-outline', onPress: () => {} },
    { title: t('profile.terms'), icon: 'document-text-outline', onPress: () => navigation.navigate('Terms') },
    { title: t('profile.support'), icon: 'call-outline', onPress: () => {} },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pt-4">
      <ScrollView>
        {/* Profile Header */}
        <View className="bg-white p-6 items-center mb-4 border-b border-gray-100">
          <View className="w-24 h-24 rounded-full bg-gold/20 justify-center items-center mb-4">
            <Text className="text-gold font-bold text-3xl">
              {user?.fullName.charAt(0)}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-dark">{user?.fullName}</Text>
          <Text className="text-gray-500 mb-2">{user?.companyName}</Text>
          <Text className="text-gray-400 text-sm mb-3">{user?.city}, {user?.state}</Text>
          
          <View className={`px-3 py-1 rounded-full ${user?.status === 'approved' ? 'bg-green-100' : 'bg-amber-100'}`}>
            <Text className={`font-bold text-xs ${user?.status === 'approved' ? 'text-green-700' : 'text-amber-700'}`}>
              {t('profile.account').replace('{{status}}', user?.status?.toUpperCase() || '')}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="bg-white border-y border-gray-100">
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={item.onPress}
              className={`flex-row items-center px-6 py-4 ${index !== menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <Ionicons name={item.icon as any} size={22} color="#4B5563" />
              <Text className="flex-1 ml-4 text-base font-medium text-dark">{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Danger Zone */}
        <View className="bg-white border-y border-gray-100 mt-4 mb-8">
          <TouchableOpacity 
            className="flex-row items-center px-6 py-4 border-b border-gray-100"
            onPress={() => navigation.navigate('DeleteAccount')}
          >
            <Ionicons name="trash-outline" size={22} color="#EF4444" />
            <Text className="flex-1 ml-4 text-base font-medium text-red-500">{t('profile.deleteAccount')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity 
            className="flex-row items-center px-6 py-4"
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text className="flex-1 ml-4 text-base font-medium text-red-500">{t('profile.logout')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
