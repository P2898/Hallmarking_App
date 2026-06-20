import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useListingsStore } from '../../store/listingsStore';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image } from 'react-native';
import { useCategoriesStore } from '../../store/categoriesStore';

export const CreateListingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { createListing } = useListingsStore();
  const { categories, subscribeToCategories } = useCategoriesStore();

  React.useEffect(() => {
    const unsub = subscribeToCategories();
    return () => unsub();
  }, [subscribeToCategories]);
  
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    category: '',
    brand: '',
    model: '',
    year: '',
    yearsUsed: '',
    condition: '',
    warranty: '',
    description: '',
    isMakeOffer: false,
    price: '',
    city: '',
    state: '',
    country: ''
  });

  // Set first category as default once loaded
  React.useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories]);

  const CATEGORIES = categories.map(c => c.name);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - photoUris.length,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newUris = result.assets.map(asset => asset.uri);
      setPhotoUris(prev => [...prev, ...newUris].slice(0, 5));
    }
  };

  const removePhoto = (index: number) => {
    setPhotoUris(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.brand || !formData.price || !formData.city || !formData.state) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    if (photoUris.length === 0) {
      Alert.alert('Error', 'Please add at least one photo');
      return;
    }

    setLoading(true);
    try {
      const selectedCategoryObj = categories.find(c => c.name === formData.category);
      await createListing({
        title: `${formData.brand} ${formData.model}`.trim(),
        categoryId: selectedCategoryObj?.id,
        location: `${formData.city}, ${formData.state}`,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        yearOfPurchase: parseInt(formData.year) || new Date().getFullYear(),
        yearsUsed: parseInt(formData.yearsUsed) || 0,
        condition: formData.condition || 'Not specified',
        warranty: formData.warranty || 'None',
        description: formData.description || '',
        pricingType: formData.isMakeOffer ? 'negotiable' : 'fixed',
        price: formData.isMakeOffer ? 0 : parseFloat(formData.price) || 0,
        city: formData.city,
        state: formData.state,
        country: formData.country,
      }, photoUris);
      
      Alert.alert('Success', 'Listing published successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit listing');
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
        <Text className="text-xl font-bold text-dark">New Listing</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View className="mb-6 gap-y-4">
            <View>
              <Text className="text-gray-600 mb-2 font-medium ml-1">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setFormData(prev => ({ ...prev, category: cat }))}
                    className={`px-4 py-2 rounded-full border mr-2 ${formData.category === cat ? 'bg-gold border-gold' : 'border-gray-300'}`}
                  >
                    <Text className={formData.category === cat ? 'text-white font-bold' : 'text-gray-600'}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Input 
              label="Brand Name"
              placeholder="e.g. Fischer, Sartorius" 
              value={formData.brand}
              onChangeText={(text) => setFormData(prev => ({...prev, brand: text}))}
            />
            <Input 
              label="Model of the Machine"
              placeholder="e.g. XAN 220" 
              value={formData.model}
              onChangeText={(text) => setFormData(prev => ({...prev, model: text}))}
            />
            <Input 
              label="Expected Price (₹)"
              placeholder="0" 
              keyboardType="numeric"
              value={formData.price}
              onChangeText={(text) => setFormData(prev => ({...prev, price: text}))}
            />
            <View className="flex-row gap-x-2">
              <View className="flex-1">
                <Input 
                  label="Year of Purchase"
                  placeholder="e.g. 2021" 
                  keyboardType="numeric"
                  value={formData.year}
                  onChangeText={(text) => setFormData(prev => ({...prev, year: text}))}
                />
              </View>
              <View className="flex-1">
                <Input 
                  label="Years Used"
                  placeholder="e.g. 3" 
                  keyboardType="numeric"
                  value={formData.yearsUsed}
                  onChangeText={(text) => setFormData(prev => ({...prev, yearsUsed: text}))}
                />
              </View>
            </View>
            <Input 
              label="Condition"
              placeholder="e.g. Good, Like New, Needs Repair" 
              value={formData.condition}
              onChangeText={(text) => setFormData(prev => ({...prev, condition: text}))}
            />
            <Input 
              label="Warranty (Optional)"
              placeholder="e.g. 1 Year, None" 
              value={formData.warranty}
              onChangeText={(text) => setFormData(prev => ({...prev, warranty: text}))}
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                {photoUris.map((uri, index) => (
                  <View key={index} className="mr-3 relative">
                    <Image source={{ uri }} style={{ width: 100, height: 100, borderRadius: 8 }} />
                    <TouchableOpacity 
                      className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
                {photoUris.length < 5 && (
                  <TouchableOpacity 
                    onPress={pickImage}
                    className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl w-[100px] h-[100px] justify-center items-center"
                  >
                    <Ionicons name="camera" size={32} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </ScrollView>
              <Text className="text-gray-400 text-xs text-right">{photoUris.length}/5 photos</Text>
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
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
