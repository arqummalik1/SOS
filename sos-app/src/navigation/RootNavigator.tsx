import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  AddItemCamera: undefined;
  AddItemGallery: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

import { AddItemCameraScreen } from '../screens/wardrobe/AddItemCameraScreen';
import { AddItemGalleryScreen } from '../screens/wardrobe/AddItemGalleryScreen';

export const RootNavigator: React.FC = () => {
  const { state } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!state.isOnboarded ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="AddItemCamera" component={AddItemCameraScreen} />
            <Stack.Screen name="AddItemGallery" component={AddItemGalleryScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
