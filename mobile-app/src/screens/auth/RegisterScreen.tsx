import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuthStore } from '../../store/authStore';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const register = useAuthStore((state) => state.register);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    fullName: '',
    userType: 'Jeweller',
    city: '',
    state: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const userTypes = ['Hallmarking Centre', 'Jeweller', 'Refiner', 'Assayer'];

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async () => {
    const { email, password, confirmPassword, companyName, fullName, userType, city, state } = formData;
    
    if (!email || !password || !confirmPassword || !companyName || !fullName || !city || !state) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      console.log('[Register] Registration initiated...');
      await register(formData);
      console.log('[Register] Registration successful!');
      Alert.alert('Success', 'Registration successful! Please log in.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('[Register] Error:', error.message || error);
      Alert.alert('Registration Error', error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
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
            <Text className="text-3xl font-extrabold text-gold tracking-widest mb-2">MachineXchange</Text>
            <Text className="text-2xl font-bold text-dark">Create Account</Text>
            <Text className="text-gray-500 mt-2 text-center">Join the premier marketplace</Text>
          </View>

          <View className="mb-6 gap-y-4">
            <Input 
              placeholder="Full Name" 
              value={formData.fullName}
              onChangeText={(text) => handleChange('fullName', text)}
            />
            <Input 
              placeholder="Company Name" 
              value={formData.companyName}
              onChangeText={(text) => handleChange('companyName', text)}
            />
            
            <View>
              <Text className="text-gray-600 mb-2 font-medium ml-1">User Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                {userTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => handleChange('userType', type)}
                    className={`px-4 py-2 rounded-full border mr-2 ${formData.userType === type ? 'bg-gold border-gold' : 'border-gray-300'}`}
                  >
                    <Text className={formData.userType === type ? 'text-white font-bold' : 'text-gray-600'}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

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
            <Input 
              placeholder="Email Address" 
              keyboardType="email-address" 
              autoCapitalize="none"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
            />
            <Input 
              placeholder="Password (min 8 characters)" 
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              }
            />
            <Input 
              placeholder="Confirm Password" 
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
              rightIcon={
                <TouchableOpacity onPress={() => setShowConfirmPassword(prev => !prev)}>
                  <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              }
            />
          </View>

          <Button 
            title="Register" 
            onPress={handleRegister} 
            loading={loading}
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
