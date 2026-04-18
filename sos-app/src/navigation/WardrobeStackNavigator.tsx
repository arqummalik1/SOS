import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MyWardrobeScreen } from '../screens/wardrobe/MyWardrobeScreen';
import { EditItemDetailsScreen } from '../screens/wardrobe/EditItemDetailsScreen';
import { ItemDetailsViewScreen } from '../screens/wardrobe/ItemDetailsViewScreen';
import { VirtualTryOnScreen } from '../screens/tryon/VirtualTryOnScreen';
import { WardrobeFiltersScreen } from '../screens/wardrobe/WardrobeFiltersScreen';
import { MyItemsScreen } from '../screens/wardrobe/MyItemsScreen';
import { WardrobeAddItemCameraScreen } from '../screens/wardrobe/WardrobeAddItemCameraScreen';
import type { EditItemDetailsParams, ItemDetailsViewParams, WardrobeMyItemsRouteParams } from './wardrobeNavParams';
import type { VirtualTryOnRouteParams } from './virtualTryOnRouteParams';

export type { VirtualTryOnRouteParams };

export type WardrobeStackParamList = {
  MyWardrobe: undefined;
  MyItems: WardrobeMyItemsRouteParams;
  /** Same camera UX as profile; opens from My Items + so we can `replace` into EditItemDetails. */
  WardrobeAddItemCamera: { folderId: string };
  EditItemDetails: EditItemDetailsParams | undefined;
  ItemDetailsView: { item: ItemDetailsViewParams };
  VirtualTryOn: VirtualTryOnRouteParams | undefined;
  WardrobeFilters: undefined;
};

const Stack = createNativeStackNavigator<WardrobeStackParamList>();

export const WardrobeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MyWardrobe">
      <Stack.Screen name="MyWardrobe" component={MyWardrobeScreen} />
      <Stack.Screen name="MyItems" component={MyItemsScreen} />
      <Stack.Screen name="WardrobeAddItemCamera" component={WardrobeAddItemCameraScreen} />
      <Stack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
      <Stack.Screen name="EditItemDetails" component={EditItemDetailsScreen} />
      <Stack.Screen name="ItemDetailsView" component={ItemDetailsViewScreen} />
      <Stack.Screen name="WardrobeFilters" component={WardrobeFiltersScreen} />
    </Stack.Navigator>
  );
};
