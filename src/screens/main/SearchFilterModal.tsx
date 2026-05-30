import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

const CATEGORIES = ['XRF Machines', 'Laser Marking', 'Micro Balances', 'Fire Assay Equipment'];
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'For Parts'];

export const SearchFilterModal: React.FC = () => {
  const navigation = useNavigation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [brand, setBrand] = useState('');
  const [city, setCity] = useState('');

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleCondition = (cond: string) => {
    setSelectedConditions(prev => 
      prev.includes(cond) ? prev.filter(c => c !== cond) : [...prev, cond]
    );
  };

  const handleApply = () => {
    navigation.goBack();
  };

  const handleClear = () => {
    setSelectedCategories([]);
    setSelectedConditions([]);
    setBrand('');
    setCity('');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <Text className="text-xl font-bold text-dark">Search & Filter</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#1A1A1A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Input 
          placeholder="Search by keyword..." 
          leftIcon={<Ionicons name="search" size={20} color="#9CA3AF" />}
          autoFocus
        />

        <View className="mb-6 mt-4">
          <Text className="text-dark font-bold text-lg mb-3">Categories</Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat}
                onPress={() => toggleCategory(cat)}
                className={`px-4 py-2 rounded-full border ${selectedCategories.includes(cat) ? 'bg-gold border-gold' : 'bg-white border-gray-300'}`}
              >
                <Text className={selectedCategories.includes(cat) ? 'text-white font-semibold' : 'text-gray-600'}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-6 gap-y-4">
          <Input 
            label="Brand"
            placeholder="Search by brand name" 
            value={brand}
            onChangeText={setBrand}
          />
          <Input 
            label="Location (City)"
            placeholder="Search by city" 
            value={city}
            onChangeText={setCity}
          />
        </View>

        <View className="mb-8">
          <Text className="text-dark font-bold text-lg mb-3">Condition</Text>
          <View className="flex-row flex-wrap gap-2">
            {CONDITIONS.map(cond => (
              <TouchableOpacity 
                key={cond}
                onPress={() => toggleCondition(cond)}
                className={`px-4 py-2 rounded-full border ${selectedConditions.includes(cond) ? 'bg-gold border-gold' : 'bg-white border-gray-300'}`}
              >
                <Text className={selectedConditions.includes(cond) ? 'text-white font-semibold' : 'text-gray-600'}>
                  {cond}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className="p-4 border-t border-gray-100 bg-white flex-row items-center">
        <TouchableOpacity onPress={handleClear} className="px-4 py-3 mr-4">
          <Text className="text-gray-500 font-bold text-lg">Clear All</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Button title="Apply Filters" onPress={handleApply} />
        </View>
      </View>
    </SafeAreaView>
  );
};
