import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/Button';

export const DeleteAccountScreen: React.FC = () => {
  const navigation = useNavigation();
  const { logout } = useAppStore();

  const handleDelete = () => {
    // In a real app, make an API call here
    logout();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark">Delete Account</Text>
      </View>

      <View className="flex-1 px-6 justify-center items-center">
        <View className="w-20 h-20 bg-red-100 rounded-full justify-center items-center mb-6">
          <Ionicons name="warning" size={40} color="#EF4444" />
        </View>

        <Text className="text-2xl font-bold text-dark text-center mb-4">
          Are you absolutely sure?
        </Text>
        
        <Text className="text-center text-gray-600 mb-10 leading-6 text-base">
          Deleting your account will permanently remove your profile and all associated listings. This action cannot be undone.
        </Text>

        <View className="w-full gap-y-4">
          <Button 
            title="Yes, Delete My Account" 
            onPress={handleDelete} 
            variant="danger" 
          />
          <Button 
            title="Cancel" 
            onPress={() => navigation.goBack()} 
            variant="outline" 
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
