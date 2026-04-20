import React, { useEffect, useRef } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/AuthContext';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator, type MainTabParamList } from './MainTabNavigator';

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  AddItemCamera: { folderId?: string } | undefined;
  AddItemGallery: { folderId?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

import { AddItemCameraScreen } from '../screens/wardrobe/AddItemCameraScreen';
import { AddItemGalleryScreen } from '../screens/wardrobe/AddItemGalleryScreen';

export const RootNavigator: React.FC = () => {
  const { state } = useAuth();
  const navigationRef = useRef<any>(null);
  const wasAuthenticated = useRef(state.isAuthenticated);

  useEffect(() => {
    if (wasAuthenticated.current && !state.isAuthenticated && navigationRef.current) {
      navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }
    wasAuthenticated.current = state.isAuthenticated;
  }, [state.isAuthenticated]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        initialRouteName={state.isOnboarded ? 'Main' : 'Auth'}
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Always render both Auth and Main so navigation.reset works after onboarding */}
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ animation: 'none' }}
        />
        <Stack.Screen
          name="Main"
          component={MainTabNavigator}
          options={{ animation: 'none' }}
        />
        <Stack.Screen name="AddItemCamera" component={AddItemCameraScreen} />
        <Stack.Screen name="AddItemGallery" component={AddItemGalleryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
