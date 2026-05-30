import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  fullWidth = true,
  loading = false,
  disabled = false,
}) => {
  let bgClass = '';
  let textClass = '';
  let borderClass = '';

  switch (variant) {
    case 'primary':
      bgClass = 'bg-gold';
      textClass = 'text-white font-bold text-center text-lg';
      break;
    case 'outline':
      bgClass = 'bg-transparent';
      textClass = 'text-gold font-bold text-center text-lg';
      borderClass = 'border-2 border-gold';
      break;
    case 'danger':
      bgClass = 'bg-red-500';
      textClass = 'text-white font-bold text-center text-lg';
      break;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`py-3 px-4 rounded-xl flex-row justify-center items-center ${fullWidth ? 'w-full' : ''} ${bgClass} ${borderClass} ${disabled ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#D4AF37' : '#FFFFFF'} />
      ) : (
        <Text className={textClass}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
