import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const TermsScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 shadow-sm z-10 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark">Terms and Conditions</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-dark mb-4">Terms of Service</Text>
        <Text className="text-gray-500 text-sm mb-6 font-medium">Last updated: Oct 2024</Text>
        
        <Text className="text-dark font-bold text-lg mb-2">1. Acceptance of Terms</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          By accessing and using MachineXchange, you accept and agree to be bound by the terms and provision of this agreement.
        </Text>

        <Text className="text-dark font-bold text-lg mb-2">2. User Accounts</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          Users are required to create an account to access certain features. Account approval is subject to verification by MachineXchange admins. We reserve the right to suspend or terminate accounts that violate our policies.
        </Text>

        <Text className="text-dark font-bold text-lg mb-2">3. Listings and Transactions</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          MachineXchange is a marketplace platform. We are not a party to any transactions between buyers and sellers. All listings must accurately represent the equipment being sold.
        </Text>

        <Text className="text-dark font-bold text-lg mb-2">4. Prohibited Content</Text>
        <Text className="text-gray-600 mb-6 leading-6">
          Users may not post false information, spam, or inappropriate content. Sharing contact information outside of the designated chat system is strictly prohibited.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};
