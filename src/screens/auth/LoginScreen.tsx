import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackParamList } from '../../types/navigation';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAppStore } from '../../store/useAppStore';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const login = useAppStore((state) => state.login);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (email && password) {
      login(email);
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
            <Text className="text-4xl font-extrabold text-gold tracking-widest mb-2">HallmarkHub</Text>
            <Text className="text-2xl font-bold text-dark">Welcome to HallmarkHub</Text>
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
              secureTextEntry 
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
            />
            
            <TouchableOpacity className="self-end mt-1">
              <Text className="text-gold font-semibold">Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <Button 
            title="Login" 
            onPress={handleLogin} 
            disabled={!email || !password}
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
