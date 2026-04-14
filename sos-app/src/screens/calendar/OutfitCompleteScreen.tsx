import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';

interface OutfitCompleteScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

type FeedbackType = 'sad' | 'neutral' | 'happy' | null;

export const OutfitCompleteScreen: React.FC<OutfitCompleteScreenProps> = ({ navigation }) => {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType>('happy');
  const panelBottomInset = Math.max(64, tabBarHeight + 49);

  const handleGoToDashboard = () => {
    const parentNav = navigation.getParent?.();
    if (parentNav) {
      parentNav.navigate('Home', { screen: 'Dashboard' });
      return;
    }
    navigation.navigate('Dashboard');
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topSection,
          {
            paddingTop: Math.max(insets.top + height * 0.085, 80),
            paddingBottom: 34,
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <View style={[styles.sparkle, styles.sparkleLeft]} pointerEvents="none">
            <Ionicons name="sparkles" size={14} color="#C2ABC9" />
          </View>

          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={42} color="#111111" />
          </View>

          <View style={[styles.sparkle, styles.sparkleRight]} pointerEvents="none">
            <Ionicons name="sparkles" size={18} color="#C2ABC9" />
          </View>
        </View>

        <Text style={styles.title}>Your outfit is completed</Text>
      </View>

      <View
        style={[
          styles.bottomSection,
          {
            paddingBottom: Math.max(insets.bottom + panelBottomInset, 56),
          },
        ]}
      >
        <Text style={styles.feedbackLabel}>Please share feedback</Text>

        <View style={styles.feedbackContainer}>
          <TouchableOpacity
            style={[
              styles.feedbackButton,
              selectedFeedback === 'sad' && styles.feedbackButtonSelected,
            ]}
            onPress={() => setSelectedFeedback('sad')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="emoticon-sad-outline"
              size={29}
              color={selectedFeedback === 'sad' ? '#B58ABC' : '#777777'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.feedbackButton,
              selectedFeedback === 'neutral' && styles.feedbackButtonSelected,
            ]}
            onPress={() => setSelectedFeedback('neutral')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="emoticon-neutral-outline"
              size={29}
              color={selectedFeedback === 'neutral' ? '#B58ABC' : '#777777'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.feedbackButton,
              selectedFeedback === 'happy' && styles.feedbackButtonSelected,
            ]}
            onPress={() => setSelectedFeedback('happy')}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="emoticon-happy-outline"
              size={29}
              color={selectedFeedback === 'happy' ? '#B58ABC' : '#777777'}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={handleGoToDashboard}
          activeOpacity={0.85}
        >
          <Text style={styles.dashboardButtonText}>Go to dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEEEEE',
  },
  topSection: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 132,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
  },
  checkmarkCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleLeft: {
    left: 10,
    top: 31,
  },
  sparkleRight: {
    right: 6,
    top: 16,
  },
  title: {
    ...typography.title3,
    fontSize: typography.title3.fontSize * 1.44,
    lineHeight: 36,
    letterSpacing: -0.1,
    color: '#111111',
    textAlign: 'center',
  },
  bottomSection: {
    width: '100%',
    backgroundColor: '#DCD5DD',
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 30,
    paddingTop: 56,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  feedbackLabel: {
    ...typography.callout,
    fontFamily: fontNames.medium,
    fontSize: typography.callout.fontSize * 1.44,
    lineHeight: 29,
    color: '#111111',
    marginBottom: 28,
  },
  feedbackContainer: {
    flexDirection: 'row',
    gap: 36,
    marginBottom: 34,
  },
  feedbackButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2.3,
    borderColor: '#777777',
  },
  feedbackButtonSelected: {
    borderColor: '#B58ABC',
  },
  dashboardButton: {
    width: '86%',
    height: 58,
    backgroundColor: '#111111',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardButtonText: {
    fontFamily: fontNames.medium,
    fontSize: 16,
    letterSpacing: -0.08,
    color: '#FFFFFF',
  },
});
