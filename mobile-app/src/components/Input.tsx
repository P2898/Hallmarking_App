import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, leftIcon, rightIcon, className = '', ...props }) => {
  return (
    <View className="w-full mb-4">
      {label && <Text className="text-dark font-semibold mb-2">{label}</Text>}
      <View className={`flex-row items-center border ${error ? 'border-red-500' : 'border-gray-300'} rounded-xl bg-white px-3 focus:border-gold h-12`}>
        {leftIcon && <View className="mr-2">{leftIcon}</View>}
        <TextInput
          className={`flex-1 h-full text-dark ${className}`}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {rightIcon && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
    </View>
  );
};
