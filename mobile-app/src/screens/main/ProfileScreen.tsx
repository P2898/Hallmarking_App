import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
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
  const { t, i18n } = useTranslation();
  const [langModalVisible, setLangModalVisible] = useState(false);

  // Map Firestore profile fields to display values
  const user = {
    fullName: userProfile?.displayName ?? userProfile?.fullName ?? 'User',
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
    { title: t('profile.language', 'Language Preference'), icon: 'language-outline', onPress: () => setLangModalVisible(true) },
    { title: t('profile.terms'), icon: 'document-text-outline', onPress: () => navigation.navigate('Terms') },
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
          {(user?.city || user?.state) && (
            <Text className="text-gray-400 text-sm mb-3">
              {[user?.city, user?.state].filter(Boolean).join(', ')}
            </Text>
          )}
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

      {/* Language Selection Modal */}
      <Modal
        visible={langModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white w-4/5 rounded-xl p-6">
            <Text className="text-xl font-bold text-dark mb-4 text-center">
              {t('profile.selectLanguage', 'Select Language')}
            </Text>
            
            <TouchableOpacity 
              className={`p-4 rounded-lg mb-2 ${i18n.language === 'en' ? 'bg-gold/20' : 'bg-gray-50'}`}
              onPress={() => { i18n.changeLanguage('en'); setLangModalVisible(false); }}
            >
              <Text className={`text-center text-base ${i18n.language === 'en' ? 'text-gold font-bold' : 'text-dark'}`}>English</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className={`p-4 rounded-lg mb-2 ${i18n.language === 'hi' ? 'bg-gold/20' : 'bg-gray-50'}`}
              onPress={() => { i18n.changeLanguage('hi'); setLangModalVisible(false); }}
            >
              <Text className={`text-center text-base ${i18n.language === 'hi' ? 'text-gold font-bold' : 'text-dark'}`}>हिंदी (Hindi)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className={`p-4 rounded-lg mb-4 ${i18n.language === 'gu' ? 'bg-gold/20' : 'bg-gray-50'}`}
              onPress={() => { i18n.changeLanguage('gu'); setLangModalVisible(false); }}
            >
              <Text className={`text-center text-base ${i18n.language === 'gu' ? 'text-gold font-bold' : 'text-dark'}`}>ગુજરાતી (Gujarati)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="p-3 mt-2 border border-gray-300 rounded-lg"
              onPress={() => setLangModalVisible(false)}
            >
              <Text className="text-center text-gray-500 font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
