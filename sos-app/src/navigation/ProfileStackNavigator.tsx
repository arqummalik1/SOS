import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { PrivacyScreen } from '../screens/profile/PrivacyScreen';
import { HelpScreen } from '../screens/profile/HelpScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { OutfitDetailScreen } from '../screens/outfit/OutfitDetailScreen';
import { WardrobeScreen } from '../screens/wardrobe/WardrobeScreen';
import { StylistScreen } from '../screens/stylist/StylistScreen';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Privacy: undefined;
  Help: undefined;
  Notifications: undefined;
  OutfitDetail: { outfit: any };
  Wardrobe: undefined;
  Stylist: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
      <Stack.Screen name="Wardrobe" component={WardrobeScreen} />
      <Stack.Screen name="Stylist" component={StylistScreen} />
    </Stack.Navigator>
  );
};
