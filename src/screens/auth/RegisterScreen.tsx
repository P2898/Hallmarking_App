import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../../firebase.config';
import { Alert } from 'react-native';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  
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
      console.log('[Register] Step 1: Creating Firebase Auth user...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('[Register] Step 2: Auth user created:', userCredential.user.uid);
      
      console.log('[Register] Step 3: Writing user profile to Firestore...');
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        fullName,
        companyName,
        userType,
        city,
        state,
        email,
        status: 'pending',
        fcmToken: null,
        createdAt: serverTimestamp(),
      });
      console.log('[Register] Step 4: Registration complete!');
      // AppNavigator will automatically route to PendingApproval because authStatus becomes 'authenticated' and approvalStatus becomes 'pending'
    } catch (error: any) {
      console.error('[Register] FULL ERROR:', JSON.stringify(error, null, 2));
      console.error('[Register] Error code:', error.code);
      console.error('[Register] Error message:', error.message);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'An account with this email already exists. Please login.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Error', 'Password must be at least 8 characters.');
      } else if (error.code === 'auth/operation-not-allowed') {
        Alert.alert('Firebase Setup Required', 'Email/Password sign-in is not enabled. Go to Firebase Console → Authentication → Sign-in method → Enable Email/Password.');
      } else if (error.code === 'auth/network-request-failed') {
        Alert.alert('Network Error', 'No internet connection. Please check your network.');
      } else if (error.code === 'auth/invalid-api-key') {
        Alert.alert('Config Error', 'Invalid Firebase API key. Check your .env file and restart Expo.');
      } else {
        Alert.alert('Registration Error', `Failed (${error.code || 'unknown'}): ${error.message || 'Please try again.'}`);
      }
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
            <Text className="text-3xl font-extrabold text-gold tracking-widest mb-2">HallmarkHub</Text>
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
              secureTextEntry 
              autoCapitalize="none"
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
            />
            <Input 
              placeholder="Confirm Password" 
              secureTextEntry 
              autoCapitalize="none"
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
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
