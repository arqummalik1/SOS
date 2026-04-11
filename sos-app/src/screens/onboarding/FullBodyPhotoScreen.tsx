import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';
import { ProfileSetupScreen } from './ProfileSetupScreen'; // To render as blurred background

const { width, height } = Dimensions.get('window');

interface FullBodyPhotoScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

/**
 * FullBodyPhotoScreen - Replicates "Profile setup 1.1.png" with 100% visual fidelity.
 * Uses a live BlurView overlay over the ProfileSetupScreen content.
 */
export const FullBodyPhotoScreen: React.FC<FullBodyPhotoScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Background - Blurred ProfileSetupScreen */}
      <View style={styles.backgroundContainer} pointerEvents="none">
        <ProfileSetupScreen navigation={navigation} />
        <BlurView 
          intensity={Platform.OS === 'ios' ? 80 : 100} 
          style={StyleSheet.absoluteFill} 
          tint="light"
        />
      </View>

      {/* Upload Card Overlay */}
      <View style={styles.overlayContainer}>
        <View style={styles.whiteCard}>
          <View style={styles.content}>
            {/* Title Section */}
            <Text style={styles.title}>Upload full photo</Text>
            <Text style={styles.subtitle}>
              This information helps us deliver a better, more personalized experience for you.
            </Text>

            {/* Upload Body Photo Section */}
            <View style={styles.uploadSection}>
              <Text style={styles.uploadLabel}>Upload your full body photo</Text>

              {/* Action Buttons */}
              <TouchableOpacity 
                style={styles.liveCaptureButton}
                onPress={() => navigation.navigate('FullBodyPhotoPreview')}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-outline" size={24} color="#000000" style={styles.buttonIcon} />
                <Text style={styles.liveCaptureText}>Live Capture</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.uploadImageButton}
                onPress={() => navigation.navigate('FullBodyPhotoPreview')}
                activeOpacity={0.9}
              >
                <Ionicons name="push-outline" size={24} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.uploadImageText}>Upload Image</Text>
              </TouchableOpacity>

              {/* Skip Link */}
              <TouchableOpacity 
                style={styles.skipContainer} 
                onPress={() => navigation.navigate('FullBodyPhotoPreview')}
                activeOpacity={0.7}
              >
                <Text style={styles.skipText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.15)', // Subtle darkening to pop the card
  },
  whiteCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingTop: height * 0.06,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 28,

    // High fidelity shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    ...typography.largeTitle,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    ...typography.subheadline,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 48,
    paddingHorizontal: 10,
  },
  uploadSection: {
    width: '100%',
    alignItems: 'center',
  },
  uploadLabel: {
    ...typography.title3,
    color: '#000000',
    marginBottom: 24,
    textAlign: 'center',
  },
  liveCaptureButton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 60,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    // Soft shadow for the white button
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  buttonIcon: {
    marginRight: 12,
  },
  liveCaptureText: {
    ...typography.headline,
    color: '#000000',
  },
  uploadImageButton: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    width: '100%',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    // Bold shadow for black button
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  uploadImageText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
  skipContainer: {
    paddingVertical: 10,
  },
  skipText: {
    ...typography.subheadline,
    color: '#111111',
  },
});
