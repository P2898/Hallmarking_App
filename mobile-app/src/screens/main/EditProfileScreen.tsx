import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAppStore();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    companyName: user?.companyName || '',
    city: user?.city || '',
    state: user?.state || ''
  });

  const handleSave = () => {
    // Mock save logic
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark">Edit Profile</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View className="mb-6 gap-y-4">
            <Input 
              label="Full Name"
              value={formData.fullName}
              onChangeText={(text) => setFormData(prev => ({...prev, fullName: text}))}
            />
            <Input 
              label="Company Name"
              value={formData.companyName}
              onChangeText={(text) => setFormData(prev => ({...prev, companyName: text}))}
            />
            
            {/* Read-only User Type */}
            <View className="mb-4">
              <Text className="text-dark font-semibold mb-2">Account Type</Text>
              <View className="bg-gray-100 px-4 py-3 rounded-xl border border-gray-200">
                <Text className="text-gray-500 font-medium">Standard User (Cannot be changed)</Text>
              </View>
            </View>

            <View className="flex-row gap-x-4">
              <View className="flex-1">
                <Input 
                  label="City"
                  value={formData.city}
                  onChangeText={(text) => setFormData(prev => ({...prev, city: text}))}
                />
              </View>
              <View className="flex-1">
                <Input 
                  label="State"
                  value={formData.state}
                  onChangeText={(text) => setFormData(prev => ({...prev, state: text}))}
                />
              </View>
            </View>
          </View>

          <Button 
            title="Save Changes" 
            onPress={handleSave} 
            disabled={!formData.fullName || !formData.companyName || !formData.city || !formData.state}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
