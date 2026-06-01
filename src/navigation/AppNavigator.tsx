import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../store/authStore';
import { SplashScreen } from '../screens/auth/SplashScreen';


import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { PendingApprovalScreen } from '../screens/auth/PendingApprovalScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { authStatus, approvalStatus, initAuth } = useAuthStore();

  React.useEffect(() => {
    initAuth();
  }, [initAuth]);

  if (authStatus === 'loading') {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {authStatus === 'unauthenticated' ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : authStatus === 'authenticated' && approvalStatus === 'pending' ? (
          <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
        ) : authStatus === 'authenticated' ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>

    </NavigationContainer>
  );
};
