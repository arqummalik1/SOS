import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OccasionSelectionScreen } from '../screens/calendar/OccasionSelectionScreen';
import { TravelPlannerScreen } from '../screens/calendar/TravelPlannerScreen';
import { MultipleOutfitsScreen } from '../screens/calendar/MultipleOutfitsScreen';
import { VirtualTryOnSecondScreen } from '../screens/calendar/VirtualTryOnSecondScreen';
import { SwitchTheItemScreen } from '../screens/calendar/SwitchTheItemScreen';
import { OutfitCompleteScreen } from '../screens/calendar/OutfitCompleteScreen';
import { CalendarAddItemCameraScreen } from '../screens/calendar/CalendarAddItemCameraScreen';
import { AddItemGalleryScreen } from '../screens/wardrobe/AddItemGalleryScreen';
import { MyItemsScreen } from '../screens/wardrobe/MyItemsScreen';

export type CalendarStackParamList = {
  OccasionSelection: undefined;
  TravelPlanner: {
    selectedOccasion: string;
    isCustomOccasion: boolean;
  };
  MultipleOutfits: undefined;
  VirtualTryOnSecond:
    | {
        selectedOutfitId?: string;
      }
    | undefined;
  SwitchTheItem: undefined;
  /** Dedicated camera UI (fork of ProfilePictureScreen) — calendar stack only, no root navigator coupling. */
  CalendarAddItemCamera: undefined;
  CalendarMyItems:
    | {
        selectionMode?: boolean;
      }
    | undefined;
  AddItemGallery: undefined;
  OutfitComplete: undefined;
};

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export const CalendarStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="OccasionSelection">
      <Stack.Screen name="OccasionSelection" component={OccasionSelectionScreen} />
      <Stack.Screen name="TravelPlanner" component={TravelPlannerScreen} />
      <Stack.Screen name="MultipleOutfits" component={MultipleOutfitsScreen} />
      <Stack.Screen name="VirtualTryOnSecond" component={VirtualTryOnSecondScreen} />
      <Stack.Screen
        name="SwitchTheItem"
        component={SwitchTheItemScreen}
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen name="CalendarAddItemCamera" component={CalendarAddItemCameraScreen} />
      <Stack.Screen name="CalendarMyItems" component={MyItemsScreen} />
      <Stack.Screen name="AddItemGallery" component={AddItemGalleryScreen} />
      <Stack.Screen name="OutfitComplete" component={OutfitCompleteScreen} />
    </Stack.Navigator>
  );
};
