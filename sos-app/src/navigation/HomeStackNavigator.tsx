import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { DashboardScreen } from '../screens/home/DashboardScreen';
import { MyItemsScreen } from '../screens/wardrobe/MyItemsScreen';
import { EditItemDetailsScreen } from '../screens/wardrobe/EditItemDetailsScreen';
import { OutfitDetailScreen } from '../screens/outfit/OutfitDetailScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { VirtualTryOnScreen } from '../screens/tryon/VirtualTryOnScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  Dashboard: undefined;
  MyItems: undefined;
  EditItemDetails: undefined;
  OutfitDetail: { outfit: any };
  Notifications: undefined;
  VirtualTryOn: { outfit?: any };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Dashboard">
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="MyItems" component={MyItemsScreen} />
      <Stack.Screen name="EditItemDetails" component={EditItemDetailsScreen} />
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
    </Stack.Navigator>
  );
};
