import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FirstScreen } from '../screens/onboarding/FirstScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { OTPScreen } from '../screens/auth/OTPScreen';
import { ProfilePictureScreen } from '../screens/onboarding/ProfilePictureScreen';
import { ProfileSetupHubScreen } from '../screens/onboarding/ProfileSetupHubScreen';
import { ProfileSetupScreen } from '../screens/onboarding/ProfileSetupScreen';
import { FullBodyPhotoScreen } from '../screens/onboarding/FullBodyPhotoScreen';
import { FullBodyCameraScreen } from '../screens/onboarding/FullBodyCameraScreen';
import { FullBodyPhotoPreviewScreen } from '../screens/onboarding/FullBodyPhotoPreviewScreen';
import { StylePreferencesScreen } from '../screens/onboarding/StylePreferencesScreen';
import { BodyMeasurementsScreen } from '../screens/onboarding/BodyMeasurementsScreen';
import { useAuth } from '../store/AuthContext';

export type AuthStackParamList = {
  First: undefined;
  Welcome: undefined;
  Splash: undefined;
  SignIn: undefined;
  OTP: undefined;
  ProfileSetupHub: undefined;
  ProfilePicture: undefined;
  ProfileSetup: { profileImage?: string };
  FullBodyPhoto: { profileImage?: string; profileData?: any };
  FullBodyCamera: { profileImage?: string; profileData?: any };
  FullBodyPhotoPreview: { fullBodyImage?: string; profileImage?: string; profileData?: any };
  StylePreferences: { profileData: any };
  BodyMeasurements: { profileData: any };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  const { state } = useAuth();
  const initialRouteName = state.isAuthenticated && !state.isOnboarded
    ? state.onboardingEntryRoute
    : 'First';
  const navigatorKey = `${state.isAuthenticated}-${state.isOnboarded}-${initialRouteName}`;

  return (
    <Stack.Navigator
      key={navigatorKey}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="First" component={FirstScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="ProfileSetupHub" component={ProfileSetupHubScreen} />
      <Stack.Screen name="ProfilePicture" component={ProfilePictureScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="FullBodyPhoto" component={FullBodyPhotoScreen} />
      <Stack.Screen name="FullBodyCamera" component={FullBodyCameraScreen} />
      <Stack.Screen name="FullBodyPhotoPreview" component={FullBodyPhotoPreviewScreen} />
      <Stack.Screen name="StylePreferences" component={StylePreferencesScreen} />
      <Stack.Screen name="BodyMeasurements" component={BodyMeasurementsScreen} />
    </Stack.Navigator>
  );
};
