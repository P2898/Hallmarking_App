import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainStackParamList, MainTabParamList } from '../types/navigation';
import { useChatStore } from '../store/chatStore';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from 'react-i18next';

// Mock screens
import { HomeFeedScreen } from '../screens/main/HomeFeedScreen';
import { MyListingsScreen } from '../screens/main/MyListingsScreen';
import { ChatListScreen } from '../screens/main/ChatListScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';
import { ListingDetailScreen } from '../screens/main/ListingDetailScreen';
import { MakeOfferScreen } from '../screens/main/MakeOfferScreen';
import { IndividualChatScreen } from '../screens/main/IndividualChatScreen';
import { CreateListingScreen } from '../screens/main/CreateListingScreen';
import { EditListingScreen } from '../screens/main/EditListingScreen';
import { SearchFilterModal } from '../screens/main/SearchFilterModal';
import { NotificationsScreen } from '../screens/main/NotificationsScreen';
import { EditProfileScreen } from '../screens/main/EditProfileScreen';
import { TermsScreen } from '../screens/main/TermsScreen';
import { DeleteAccountScreen } from '../screens/main/DeleteAccountScreen';
import { BuyHistoryScreen } from '../screens/main/BuyHistoryScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<MainStackParamList>();

const TabNavigator = () => {
  const { chats, fetchChats } = useChatStore();
  const { user } = useAuthStore();
  const { t } = useTranslation();
  
  React.useEffect(() => {
    if (user) {
      const unsubscribe = fetchChats();
      return () => unsubscribe();
    }
  }, [user, fetchChats]);

  const totalUnread = chats.reduce((sum, chat) => {
    if (chat.unreadCount > 0 && chat.lastSenderId !== user?.uid) {
      return sum + chat.unreadCount;
    }
    return sum;
  }, 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#D4AF37', // Gold
        tabBarInactiveTintColor: '#9CA3AF', // Gray
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#E5E7EB' },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'MyListings') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Chat') iconName = focused ? 'chatbubble' : 'chatbubble-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeFeedScreen} options={{ tabBarLabel: t('tabs.home') }} />
      <Tab.Screen name="MyListings" component={MyListingsScreen} options={{ tabBarLabel: t('tabs.myListings') }} />
      <Tab.Screen 
        name="Chat" 
        component={ChatListScreen} 
        options={{ tabBarBadge: totalUnread > 0 ? totalUnread : undefined, tabBarLabel: t('tabs.chat') }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('tabs.profile') }} />
    </Tab.Navigator>
  );
};

export const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
      <Stack.Screen name="MakeOffer" component={MakeOfferScreen} />
      <Stack.Screen name="IndividualChat" component={IndividualChatScreen} />
      <Stack.Screen name="CreateListing" component={CreateListingScreen} />
      <Stack.Screen name="EditListing" component={EditListingScreen} />
      <Stack.Screen name="BuyHistory" component={BuyHistoryScreen} />
      <Stack.Screen name="SearchFilterModal" component={SearchFilterModal} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
    </Stack.Navigator>
  );
};
