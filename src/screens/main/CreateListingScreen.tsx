import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useDataStore } from '../../store/useDataStore';

export const CreateListingScreen: React.FC = () => {
  const navigation = useNavigation();
  const addListing = useDataStore(state => state.addListing);

  const [formData, setFormData] = useState({
    category: 'XRF Machines',
    brand: '',
    year: '',
    condition: 'Excellent',
    description: '',
    isMakeOffer: false,
    price: '',
    city: '',
    state: ''
  });

  const handleSubmit = () => {
    if (formData.brand && formData.price) {
      addListing({
        sellerId: '1',
        category: formData.category as any,
        brand: formData.brand,
        year: parseInt(formData.year) || 2024,
        condition: formData.condition as any,
        description: formData.description,
        isMakeOffer: formData.isMakeOffer,
        price: parseFloat(formData.price) || 0,
        city: formData.city,
        state: formData.state,
        image: 'mock-new'
      });
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-dark">New Listing</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View className="mb-6 gap-y-4">
            <Input 
              label="Brand Name"
              placeholder="e.g. Fischer, Sartorius" 
              value={formData.brand}
              onChangeText={(text) => setFormData(prev => ({...prev, brand: text}))}
            />
            <Input 
              label="Expected Price (₹)"
              placeholder="0" 
              keyboardType="numeric"
              value={formData.price}
              onChangeText={(text) => setFormData(prev => ({...prev, price: text}))}
            />
            <Input 
              label="Year of Purchase"
              placeholder="e.g. 2021" 
              keyboardType="numeric"
              value={formData.year}
              onChangeText={(text) => setFormData(prev => ({...prev, year: text}))}
            />
            
            <View className="mb-4">
              <Text className="text-dark font-semibold mb-2">Pricing Type</Text>
              <View className="flex-row border border-gray-300 rounded-xl overflow-hidden">
                <TouchableOpacity 
                  className={`flex-1 py-3 items-center ${!formData.isMakeOffer ? 'bg-gold' : 'bg-white'}`}
                  onPress={() => setFormData(prev => ({...prev, isMakeOffer: false}))}
                >
                  <Text className={`font-semibold ${!formData.isMakeOffer ? 'text-white' : 'text-gray-500'}`}>Fixed Price</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className={`flex-1 py-3 items-center ${formData.isMakeOffer ? 'bg-gold' : 'bg-white'}`}
                  onPress={() => setFormData(prev => ({...prev, isMakeOffer: true}))}
                >
                  <Text className={`font-semibold ${formData.isMakeOffer ? 'text-white' : 'text-gray-500'}`}>Make an Offer</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-dark font-semibold mb-2">Machine Location</Text>
              <View className="flex-row gap-x-2">
                <View className="flex-1">
                  <Input 
                    placeholder="City" 
                    value={formData.city}
                    onChangeText={(text) => setFormData(prev => ({...prev, city: text}))}
                  />
                </View>
                <View className="flex-1">
                  <Input 
                    placeholder="State" 
                    value={formData.state}
                    onChangeText={(text) => setFormData(prev => ({...prev, state: text}))}
                  />
                </View>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-dark font-semibold mb-2">Photos (Required)</Text>
              <TouchableOpacity className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl h-32 justify-center items-center">
                <Ionicons name="camera" size={32} color="#9CA3AF" />
                <Text className="text-gray-500 font-medium mt-2">Tap to upload photos</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-6">
              <Text className="text-dark font-semibold mb-2">Description</Text>
              <View className="border border-gray-300 rounded-xl bg-white p-3 h-32 focus:border-gold">
                <TextInput
                  className="flex-1 text-dark"
                  placeholder="Describe the condition, usage, and any defects..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  textAlignVertical="top"
                  value={formData.description}
                  onChangeText={(text) => setFormData(prev => ({...prev, description: text}))}
                />
              </View>
            </View>
          </View>

          <View className="bg-amber-50 p-4 rounded-xl mb-6 flex-row items-start">
            <Ionicons name="information-circle" size={20} color="#D97706" className="mt-0.5 mr-2" />
            <Text className="text-amber-700 flex-1">
              Your listing will be reviewed by admin before going live. Please ensure all details are accurate.
            </Text>
          </View>

          <Button 
            title="Submit Listing" 
            onPress={handleSubmit} 
            disabled={!formData.brand || !formData.price || !formData.city || !formData.state}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
