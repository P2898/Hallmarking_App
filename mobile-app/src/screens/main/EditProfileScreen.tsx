import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Alert } from 'react-native';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userProfile, updateProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: userProfile?.displayName || userProfile?.fullName || '',
    companyName: userProfile?.companyName || '',
    city: userProfile?.city || '',
    state: userProfile?.state || '',
    password: '',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const dataToUpdate: any = {
        displayName: formData.fullName,
        companyName: formData.companyName,
        city: formData.city,
        state: formData.state,
      };
      
      if (formData.password) {
        if (formData.password.length < 6) {
          Alert.alert('Error', 'Password must be at least 6 characters long');
          setLoading(false);
          return;
        }
        dataToUpdate.password = formData.password;
      }

      await updateProfile(dataToUpdate);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
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

            <View className="mt-4 pt-4 border-t border-gray-100">
              <Text className="text-dark font-bold text-lg mb-4">Reset Password</Text>
              <Input 
                label="New Password"
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({...prev, password: text}))}
                secureTextEntry
                placeholder="Leave blank to keep current password"
              />
            </View>
          </View>

          <Button 
            title={loading ? "Saving..." : "Save Changes"} 
            onPress={handleSave} 
            disabled={loading || !formData.fullName}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
