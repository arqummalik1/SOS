import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { fontNames } from '../../theme/fonts';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

const { width, height } = Dimensions.get('window');

interface FullBodyPhotoScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'FullBodyPhoto'>;
  route: RouteProp<AuthStackParamList, 'FullBodyPhoto'>;
}

/**
 * FullBodyPhotoScreen — Pixel-perfect match for "Profile setup 1.1.png".
 *
 * Layout:
 *   [Blurred profile image from previous screen fills background]
 *   [Bottom white card with top-radius]
 *     → "Upload full photo" (large bold title)
 *     → Subtitle
 *     → "Upload your full body photo" (section label)
 *     → White pill: "Live Capture" (no border, shadow only, 75% width)
 *     → Black pill: "Upload Image" (75% width)
 *     → "Skip for now" link
 */
export const FullBodyPhotoScreen: React.FC<FullBodyPhotoScreenProps> = ({ navigation, route }) => {
  const profileImage = route.params?.profileImage;
  const profileData = route.params?.profileData;

  /* ── Live Capture → FullBodyCamera ── */
  const handleLiveCapture = () => {
    navigation.navigate('FullBodyCamera', { profileImage, profileData });
  };

  /* ── Upload from Gallery ── */
  const handleUploadImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Gallery access is required to select a photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]) {
      navigation.navigate('FullBodyPhotoPreview', {
        fullBodyImage: result.assets[0].uri,
        profileImage,
        profileData,
      });
    }
  };

  /* ── Skip ── */
  const handleSkip = () => {
    navigation.navigate('FullBodyPhotoPreview', {
      profileImage,
      profileData,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ── Blurred Background (profile image from camera) ── */}
      <View style={styles.backgroundContainer}>
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            style={styles.backgroundImage}
            resizeMode="cover"
            blurRadius={Platform.OS === 'android' ? 25 : 0}
          />
        ) : (
          <Image
            source={require('../../../assets/images/mosaic/fashion1.jpg')}
            style={styles.backgroundImage}
            resizeMode="cover"
            blurRadius={Platform.OS === 'android' ? 25 : 0}
          />
        )}
        {/* iOS gets superior native blur */}
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={60}
            style={StyleSheet.absoluteFill}
            tint="light"
          />
        )}
        {/* Semi-transparent overlay for depth */}
        <View style={styles.blurOverlay} />
      </View>

      {/* ── Bottom White Card ── */}
      <View style={styles.overlayContainer}>
        <View style={styles.whiteCard}>
          <View style={styles.content}>
            {/* Title */}
            <Text style={styles.title}>Upload full photo</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              This information helps us deliver a better,{'\n'}more personalized experience for you.
            </Text>

            {/* Section Label */}
            <Text style={styles.uploadLabel}>Upload your full body photo</Text>

            {/* ── Live Capture (White, shadow-only, NO border) ── */}
            <TouchableOpacity
              style={styles.liveCaptureButton}
              onPress={handleLiveCapture}
              activeOpacity={0.8}
            >
              <Ionicons name="camera-outline" size={22} color="#000000" style={styles.buttonIcon} />
              <Text style={styles.liveCaptureText}>Live Capture</Text>
            </TouchableOpacity>

            {/* ── Upload Image (Black) ── */}
            <TouchableOpacity
              style={styles.uploadImageButton}
              onPress={handleUploadImage}
              activeOpacity={0.9}
            >
              <Ionicons name="cloud-upload-outline" size={22} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.uploadImageText}>Upload Image</Text>
            </TouchableOpacity>

            {/* ── Skip ── */}
            <TouchableOpacity
              style={styles.skipContainer}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  /* ── Blurred Background ── */
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(245, 245, 245, 0.35)',
  },

  /* ── Overlay ── */
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  /* ── White Card ── */
  whiteCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 40,
    paddingBottom: Platform.OS === 'ios' ? 50 : 36,
    paddingHorizontal: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 16,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },

  /* ── Title ── */
  title: {
    fontFamily: fontNames.bold,
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },

  /* ── Subtitle ── */
  subtitle: {
    fontFamily: fontNames.regular,
    fontSize: 14,
    lineHeight: 21,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 36,
  },

  /* ── Section label ── */
  uploadLabel: {
    fontFamily: fontNames.bold,
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },

  /* ── Live Capture (White, no border, shadow only) ── */
  liveCaptureButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    width: '75%',
    height: 54,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 10,
  },
  liveCaptureText: {
    fontFamily: fontNames.medium,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },

  /* ── Upload Image (Black) ── */
  uploadImageButton: {
    flexDirection: 'row',
    backgroundColor: '#0A0A0A',
    width: '75%',
    height: 54,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  uploadImageText: {
    fontFamily: fontNames.medium,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* ── Skip ── */
  skipContainer: {
    paddingVertical: 8,
  },
  skipText: {
    fontFamily: fontNames.regular,
    fontSize: 14,
    color: '#333333',
  },
});
