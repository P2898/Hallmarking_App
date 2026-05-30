import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useAppStore } from '../../store/useAppStore';

export const SplashScreen: React.FC = () => {
  const setHasSeenSplash = useAppStore((state) => state.setHasSeenSplash);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasSeenSplash(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [setHasSeenSplash]);

  return (
    <View className="flex-1 bg-gold justify-center items-center">
      <Text className="text-white text-5xl font-extrabold tracking-widest">HallmarkHub</Text>
    </View>
  );
};
