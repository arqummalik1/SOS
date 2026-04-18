import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MyWardrobeScreen } from '../screens/wardrobe/MyWardrobeScreen';
import { EditItemDetailsScreen } from '../screens/wardrobe/EditItemDetailsScreen';
import { ItemDetailsViewScreen } from '../screens/wardrobe/ItemDetailsViewScreen';
import { VirtualTryOnScreen } from '../screens/tryon/VirtualTryOnScreen';
import { WardrobeFiltersScreen } from '../screens/wardrobe/WardrobeFiltersScreen';
import { FolderDetailScreen } from '../screens/wardrobe/FolderDetailScreen';
import type { WardrobeFolder } from '../models/WardrobeFolder.model';
import type { EditItemDetailsParams, ItemDetailsViewParams } from './wardrobeNavParams';

export type WardrobeStackParamList = {
  MyWardrobe: undefined;
  FolderDetail: { folderId: string; folderName?: string; folder?: WardrobeFolder };
  EditItemDetails: EditItemDetailsParams | undefined;
  ItemDetailsView: { item: ItemDetailsViewParams };
  VirtualTryOn: undefined;
  WardrobeFilters: undefined;
};

const Stack = createNativeStackNavigator<WardrobeStackParamList>();

export const WardrobeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="MyWardrobe">
      <Stack.Screen name="MyWardrobe" component={MyWardrobeScreen} />
      <Stack.Screen name="FolderDetail" component={FolderDetailScreen} />
      <Stack.Screen name="VirtualTryOn" component={VirtualTryOnScreen} />
      <Stack.Screen name="EditItemDetails" component={EditItemDetailsScreen} />
      <Stack.Screen name="ItemDetailsView" component={ItemDetailsViewScreen} />
      <Stack.Screen name="WardrobeFilters" component={WardrobeFiltersScreen} />
    </Stack.Navigator>
  );
};
