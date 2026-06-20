import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useAuthStore } from '../../store/authStore';

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      await forgotPassword(email);
      Alert.alert('Success', 'Password reset email sent. Check your inbox.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Email not found. Please check and try again.');
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
          <View className="mb-6 mt-4">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mb-6">
              <Text className="text-gray-500 font-medium">← Back to Login</Text>
            </TouchableOpacity>
            
            <Text className="text-3xl font-extrabold text-gold mb-2">Reset Password</Text>
            <Text className="text-gray-500 text-base">
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          <View className="mb-6">
            <Input 
              placeholder="Email Address" 
              keyboardType="email-address" 
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Button 
            title="Send Reset Link" 
            onPress={handleResetPassword} 
            disabled={!email || loading}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
