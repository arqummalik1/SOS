import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FirstScreen } from '../screens/onboarding/FirstScreen';
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { SignInScreen } from '../screens/auth/SignInScreen';
import { OTPScreen } from '../screens/auth/OTPScreen';
import { ProfilePictureScreen } from '../screens/onboarding/ProfilePictureScreen';
import { ProfileSetupScreen } from '../screens/onboarding/ProfileSetupScreen';
import { FullBodyPhotoScreen } from '../screens/onboarding/FullBodyPhotoScreen';
import { FullBodyPhotoPreviewScreen } from '../screens/onboarding/FullBodyPhotoPreviewScreen';
import { StylePreferencesScreen } from '../screens/onboarding/StylePreferencesScreen';
import { BodyMeasurementsScreen } from '../screens/onboarding/BodyMeasurementsScreen';

export type AuthStackParamList = {
  First: undefined;
  Welcome: undefined;
  Splash: undefined;
  SignIn: undefined;
  OTP: undefined;
  ProfilePicture: undefined;
  ProfileSetup: undefined;
  FullBodyPhoto: undefined;
  FullBodyPhotoPreview: undefined;
  StylePreferences: { profileData: any };
  BodyMeasurements: { profileData: any };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="First"
    >
      <Stack.Screen name="First" component={FirstScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="ProfilePicture" component={ProfilePictureScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="StylePreferences" component={StylePreferencesScreen} />
      <Stack.Screen name="BodyMeasurements" component={BodyMeasurementsScreen} />
      <Stack.Screen name="FullBodyPhoto" component={FullBodyPhotoScreen} />
      <Stack.Screen name="FullBodyPhotoPreview" component={FullBodyPhotoPreviewScreen} />
    </Stack.Navigator>
  );
};
