import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAppStore } from '../../store/useAppStore';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const register = useAppStore((state) => state.register);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    personName: '',
    city: '',
    state: ''
  });

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = () => {
    if (formData.email && formData.password && formData.companyName) {
      register(formData);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16 }}>
          <View className="items-center mb-8 mt-4">
            <Text className="text-3xl font-extrabold text-gold tracking-widest mb-2">HallmarkHub</Text>
            <Text className="text-2xl font-bold text-dark">Create Account</Text>
            <Text className="text-gray-500 mt-2 text-center">Join the premier marketplace</Text>
          </View>

          <View className="mb-6 gap-y-4">
            <Input 
              placeholder="Full Name (Person Name)" 
              value={formData.personName}
              onChangeText={(text) => handleChange('personName', text)}
            />
            <Input 
              placeholder="Company Name" 
              value={formData.companyName}
              onChangeText={(text) => handleChange('companyName', text)}
            />
            <Input 
              placeholder="Email Address" 
              keyboardType="email-address" 
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
            />
            <Input 
              placeholder="Password" 
              secureTextEntry 
              autoCapitalize="none"
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
            />
            <Input 
              placeholder="City" 
              value={formData.city}
              onChangeText={(text) => handleChange('city', text)}
            />
            <Input 
              placeholder="State" 
              value={formData.state}
              onChangeText={(text) => handleChange('state', text)}
            />
          </View>

          <Button 
            title="Register" 
            onPress={handleRegister} 
            disabled={!formData.email || !formData.password || !formData.companyName}
          />

          <View className="flex-row justify-center mt-6 mb-4">
            <Text className="text-gray-500">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-gold font-bold">Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
