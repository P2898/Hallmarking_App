import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackParamList } from '../../types/navigation';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase.config';
import { Alert } from 'react-native';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation is handled by AppNavigator listening to auth state changes
    } catch (error: any) {
      console.error('[Login Error]:', error);
      let errorMessage = `Login failed. Please try again.\n\nDetails: ${error.message || error.code || 'Unknown error'}`;
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Incorrect email or password. Please try again.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }
      Alert.alert('Login Error', errorMessage);
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
              secureTextEntry 
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
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
