import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SearchScreen } from '../screens/search/SearchScreen';
import { OutfitDetailScreen } from '../screens/outfit/OutfitDetailScreen';

export type SearchStackParamList = {
  SearchMain: undefined;
  OutfitDetail: { outfit: any };
};

const Stack = createNativeStackNavigator<SearchStackParamList>();

export const SearchStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SearchMain" component={SearchScreen} />
      <Stack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
    </Stack.Navigator>
  );
};
