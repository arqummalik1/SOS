import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

/** Calendar stack screens where the floating tab bar must not cover the UI (e.g. full-screen camera). */
const CALENDAR_SCREENS_HIDE_TAB_BAR = new Set<string>(['CalendarAddItemCamera']);
/** Wardrobe stack screens where full camera UI needs unobstructed bottom controls. */
const WARDROBE_SCREENS_HIDE_TAB_BAR = new Set<string>(['WardrobeAddItemCamera']);
const FIRST_OPEN_LOADING_TABS = new Set<string>(['Calendar', 'Wardrobe']);

/**
 * CustomTabBar - Replicates the "Liquid Glass" bar with 5 circular buttons.
 * As seen in the user provided reference image.
 */
export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    () => new Set<string>([state.routes[state.index]?.name ?? 'Home'])
  );
  const clearPendingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const activeRouteName = state.routes[state.index]?.name;
    if (activeRouteName == null) {
      return;
    }

    setVisitedTabs((prev) => {
      if (prev.has(activeRouteName)) {
        return prev;
      }

      const next = new Set(prev);
      next.add(activeRouteName);
      return next;
    });

    if (pendingRoute === activeRouteName) {
      setPendingRoute(null);
    }
  }, [pendingRoute, state.index, state.routes]);

  useEffect(() => {
    return () => {
      if (clearPendingTimeoutRef.current != null) {
        clearTimeout(clearPendingTimeoutRef.current);
      }
    };
  }, []);

  const currentTabRoute = state.routes[state.index];
  if (currentTabRoute.name === 'Calendar') {
    const nestedName = getFocusedRouteNameFromRoute(currentTabRoute);
    if (nestedName != null && CALENDAR_SCREENS_HIDE_TAB_BAR.has(nestedName)) {
      return null;
    }
  }
  if (currentTabRoute.name === 'Wardrobe') {
    const nestedName = getFocusedRouteNameFromRoute(currentTabRoute);
    if (nestedName != null && WARDROBE_SCREENS_HIDE_TAB_BAR.has(nestedName)) {
      return null;
    }
  }

  return (
    <View style={styles.container}>
      <BlurView intensity={60} tint="light" style={styles.blurContainer}>
        <View style={styles.innerContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              if (pendingRoute != null && pendingRoute === route.name) {
                return;
              }

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!event.defaultPrevented) {
                if (!isFocused) {
                  const shouldShowFirstLoadLoader =
                    FIRST_OPEN_LOADING_TABS.has(route.name) && !visitedTabs.has(route.name);

                  if (shouldShowFirstLoadLoader) {
                    setPendingRoute(route.name);

                    if (clearPendingTimeoutRef.current != null) {
                      clearTimeout(clearPendingTimeoutRef.current);
                    }
                    // Safety fallback: always clear loader even if navigation gets interrupted.
                    clearPendingTimeoutRef.current = setTimeout(() => {
                      setPendingRoute(null);
                    }, 3500);
                  }

                  requestAnimationFrame(() => {
                    if (route.name === 'Wardrobe') {
                      navigation.navigate('Wardrobe', { screen: 'MyWardrobe' } as never);
                      return;
                    }
                    navigation.navigate(route.name);
                  });
                }
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            // Icon Mapping based on route name
            let IconComponent: any = Ionicons;
            let iconName: any = 'home';
            let iconSize = 24;
            const isPending = pendingRoute === route.name;

            switch (route.name) {
              case 'Home':
                iconName = isFocused ? 'home' : 'home-outline';
                break;
              case 'Wardrobe':
                IconComponent = MaterialCommunityIcons;
                iconName = isFocused ? 'wardrobe' : 'wardrobe-outline';
                iconSize = 26;
                break;
              case 'Add':
                iconName = 'add';
                iconSize = 32;
                break;
              case 'Calendar':
                iconName = isFocused ? 'calendar' : 'calendar-outline';
                break;
              case 'Profile':
                iconName = isFocused ? 'person' : 'person-outline';
                break;
              default:
                iconName = 'home';
            }

            return (
              <TouchableOpacity
                key={index}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                onLongPress={onLongPress}
                style={[
                  styles.tabButton,
                  isFocused ? styles.tabButtonActive : styles.tabButtonInactive
                ]}
                activeOpacity={0.8}
              >
                <IconComponent 
                  name={iconName}
                  size={iconSize}
                  color={isFocused ? '#FFFFFF' : 'rgba(0, 0, 0, 0.4)'} // Muted grey for inactive readability
                />
                {isPending ? (
                  <View style={styles.pendingLoaderOverlay}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 34 : 24,
    left: 24,
    right: 24,
    height: 72,
    borderRadius: 36,
    // Deeper Liquid Glass Shadow for separation from white backgrounds
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
    overflow: 'hidden',
  },
  blurContainer: {
    flex: 1,
    backgroundColor: 'rgba(210, 210, 210, 0.85)', // Darker silver extraction for visibility
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    height: '100%',
  },
  tabButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#666666', // Precise Charcoal Grey from reference
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  tabButtonInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.45)', // Brighter etched look
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    // Subtle shadow on the bubble to make it pop
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  pendingLoaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
