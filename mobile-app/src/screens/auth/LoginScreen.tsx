import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackParamList } from '../../types/navigation';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuthStore } from '../../store/authStore';
import { Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const login = useAuthStore((state) => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    
    setLoading(true);
    try {
      await login(email, password);
      // Navigation is handled by AppNavigator listening to auth state changes
    } catch (error: any) {
      console.error('[Login Error]:', error);
      Alert.alert('Login Error', error.message || 'Login failed. Please check your credentials.');
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
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, justifyContent: 'center' }}>
          <View className="items-center mb-10">
            <Text className="text-4xl font-extrabold text-gold tracking-widest mb-2">MachineXchange</Text>
            <Text className="text-2xl font-bold text-dark">Welcome to MachineXchange</Text>
            <Text className="text-gray-500 mt-2 text-center">Login to your account to continue</Text>
          </View>

          <View className="mb-6 gap-y-4">
            <Input 
              placeholder="Email Address" 
              keyboardType="email-address" 
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <Input 
              placeholder="Password" 
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9CA3AF" />
                </TouchableOpacity>
              }
            />
            
            <TouchableOpacity className="self-end mt-1" onPress={() => navigation.navigate('ForgotPassword')}>
              <Text className="text-gold font-semibold">Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button 
            title="Login" 
            onPress={handleLogin} 
            disabled={!email || !password || loading}
            loading={loading}
          />

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-gold font-bold">Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
