import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';

export const PendingApprovalScreen: React.FC = () => {
  const { logout } = useAuthStore();

  return (
    <SafeAreaView className="flex-1 bg-white justify-center items-center px-6">
      <View className="mb-10 items-center">
        <Text className="text-3xl font-extrabold text-gold tracking-widest">HallmarkHub</Text>
      </View>

      <View className="items-center mb-8 bg-gold/10 p-6 rounded-full">
        <Ionicons name="time-outline" size={80} color="#D4AF37" />
      </View>

      <Text className="text-2xl font-bold text-dark text-center mb-4">
        Account Under Review
      </Text>
      <Text className="text-center text-gray-500 mb-10 leading-6">
        Our team is verifying your details. You will be notified once approved.
      </Text>

      <View className="w-full gap-y-3">
        <Button 
          title="Call Support" 
          onPress={() => {}} 
          variant="outline" 
        />
      </View>

      <Text 
        className="text-red-500 mt-6 font-medium" 
        onPress={logout}
      >
        Logout
      </Text>
    </SafeAreaView>
  );
};
