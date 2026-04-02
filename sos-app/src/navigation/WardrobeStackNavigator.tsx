import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MyWardrobeScreen } from '../screens/wardrobe/MyWardrobeScreen';
import { EditItemDetailsScreen } from '../screens/wardrobe/EditItemDetailsScreen';
import { VirtualTryOnScreen } from '../screens/tryon/VirtualTryOnScreen';
import { WardrobeFiltersScreen } from '../screens/wardrobe/WardrobeFiltersScreen';

export type WardrobeStackParamList = {
  MyWardrobe: undefined;
  EditItemDetails: undefined;
  VirtualTryOn: undefined;
  WardrobeFilters: undefined;
};

const Stack = createNativeStackNavigator<WardrobeStackParamList>();

export const WardrobeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MyWardrobe">
      <Stack.Screen name="MyWardrobe" component={MyWardrobeScreen} />
      <Stack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
      <Stack.Screen name="EditItemDetails" component={EditItemDetailsScreen} />
      <Stack.Screen name="WardrobeFilters" component={WardrobeFiltersScreen} />
    </Stack.Navigator>
  );
};
