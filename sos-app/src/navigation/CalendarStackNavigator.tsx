import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OccasionSelectionScreen } from '../screens/calendar/OccasionSelectionScreen';
import { TravelPlannerScreen } from '../screens/calendar/TravelPlannerScreen';
import { MultipleOutfitsScreen } from '../screens/calendar/MultipleOutfitsScreen';
import { VirtualTryOnSecondScreen } from '../screens/calendar/VirtualTryOnSecondScreen';
import { OutfitCompleteScreen } from '../screens/calendar/OutfitCompleteScreen';

export type CalendarStackParamList = {
  OccasionSelection: undefined;
  TravelPlanner: undefined;
  MultipleOutfits: undefined;
  VirtualTryOnSecond: undefined;
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
      <Stack.Screen name="OutfitComplete" component={OutfitCompleteScreen} />
    </Stack.Navigator>
  );
};
