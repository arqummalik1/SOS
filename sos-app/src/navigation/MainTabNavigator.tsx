import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeStackNavigator } from './HomeStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { WardrobeStackNavigator } from './WardrobeStackNavigator';
import { CalendarStackNavigator } from './CalendarStackNavigator';
import { AddScreen } from '../screens/add/AddScreen';
import { CustomTabBar } from './components/CustomTabBar';

export type MainTabParamList = {
  Home: undefined;
  Wardrobe: undefined;
  Add: undefined;
  Calendar: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * MainTabNavigator - Uses the CustomTabBar to match the circular glass design.
 */
export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeStackNavigator} />
      <Tab.Screen name="Wardrobe" component={WardrobeStackNavigator} />
      <Tab.Screen name="Add" component={AddScreen} /> 
      <Tab.Screen name="Calendar" component={CalendarStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
};
