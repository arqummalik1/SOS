import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingMosaic } from '../../components/layout/OnboardingMosaic';
import { typography } from '../../theme/typography';
import { fontNames } from '../../theme/fonts';

interface ProfileSetupHubScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

/**
 * ProfileSetupHubScreen
 *
 * Figma Layout (top → bottom inside the white card):
 *  1. Title:    "Profile setup"           (Kyiv Sans Bold, large)
 *  2. Subtitle: "This information helps…" (Regular, grey, centre)
 *  3. Label:    "Upload your photo"       (Regular, black, left/centre)
 *  4. Button 1: [camera icon] Live camera  (WHITE pill, black border/text)
 *  5. Button 2: [upload icon] Upload image (BLACK pill, white text)
 *  6. Link:     "Skip for now"             (underlined, centre)
 */
export const ProfileSetupHubScreen: React.FC<ProfileSetupHubScreenProps> = ({ navigation }) => {
  const navigateToCamera = () => {
    navigation.navigate('ProfilePicture');
  };

  const handleUpload = () => {
    // TODO: integrate expo-image-picker in a future sprint
  };

  const handleSkip = () => {
    navigation.navigate('StylePreferences', { profileData: {} });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Full-screen marquee background — no zIndex to preserve real-device visibility */}
      <View style={styles.backgroundLayer} pointerEvents="none">
        <OnboardingMosaic />
      </View>

      {/* Push the card to the bottom */}
      <View style={styles.contentContainer}>
        <View style={styles.bottomCard}>
          {/* ── 1. Title ── */}
          <Text style={styles.title}>Profile setup</Text>

          {/* ── 2. Subtitle ── */}
          <Text style={styles.subtitle}>
            This information helps us deliver a better more personalized experience for you.
          </Text>

          {/* ── 3. Section label ── */}
          <Text style={styles.sectionLabel}>Upload your photo</Text>

          {/* ── 4 & 5. Buttons ── */}
          <View style={styles.actionSection}>
            {/* Button A – White (Live camera) comes FIRST per Figma */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={navigateToCamera}
              activeOpacity={0.75}
            >
              <Ionicons name="camera-outline" size={22} color="#0A0A0A" style={styles.buttonIcon} />
              <Text style={styles.secondaryButtonText}>Live camera</Text>
            </TouchableOpacity>

            {/* Button B – Black (Upload image) comes SECOND per Figma */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleUpload}
              activeOpacity={0.9}
            >
              <Ionicons name="cloud-upload-outline" size={22} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.primaryButtonText}>Upload image</Text>
            </TouchableOpacity>
          </View>

          {/* ── 6. Skip link ── */}
          <TouchableOpacity onPress={handleSkip} style={styles.skipContainer} activeOpacity={0.6}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  /* ─── Root ─────────────────────────────────────────────── */
  container: {
    flex: 1,
    // Matches OnboardingMosaic base colour — prevents the white-flash on mount
    backgroundColor: '#F7F7F7',
  },

  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    // No zIndex — avoids mosaic becoming invisible on Android real devices
  },

  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  /* ─── White bottom card ─────────────────────────────────── */
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    paddingTop: 40,
    paddingHorizontal: 28,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
    width: '100%',
    // Subtle upward shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 18,
  },

  /* ─── Typography ────────────────────────────────────────── */
  title: {
    fontFamily: fontNames.bold,   // Kyiv Sans Bold
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  subtitle: {
    fontFamily: fontNames.regular,
    fontSize: 14,
    lineHeight: 21,
    color: '#6B6B6B',
    textAlign: 'center',
    marginBottom: 28,
  },

  sectionLabel: {
    fontFamily: fontNames.medium,
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    width: '100%',
    marginBottom: 14,
  },

  /* ─── Buttons wrapper ────────────────────────────────────── */
  actionSection: {
    width: '100%',
    alignItems: 'center',
    gap: 14,
    marginBottom: 28,
  },

  /* ── White button (Live Capture) — no border, soft shadow only ── */
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: 54,
    width: '75%',
    // Subtle all-around shadow — matches the soft elevated look from Figma
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  secondaryButtonText: {
    fontFamily: fontNames.medium,
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0A0A',
  },

  /* ── Black button (Upload Image) ── */
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0A',
    borderRadius: 16,
    height: 54,
    width: '75%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  primaryButtonText: {
    fontFamily: fontNames.medium,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  buttonIcon: {
    marginRight: 10,
  },

  /* ── Skip link ── */
  skipContainer: {
    alignSelf: 'center',
    paddingVertical: 4,
  },

  skipText: {
    fontFamily: fontNames.regular,
    fontSize: 14,
    color: '#000000',
    textDecorationLine: 'underline',
  },
});
