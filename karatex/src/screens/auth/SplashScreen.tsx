import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
export const SplashScreen: React.FC = () => {

  return (
    <View className="flex-1 bg-gold justify-center items-center">
      <Text className="text-white text-5xl font-extrabold tracking-widest">MachineXchange</Text>
    </View>
  );
};
