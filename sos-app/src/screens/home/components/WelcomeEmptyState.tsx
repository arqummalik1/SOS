import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../../store/UserContext';
import { fontNames } from '../../../theme/fonts';
import { typography } from '../../../theme/typography';

const { width, height } = Dimensions.get('window');

interface WelcomeEmptyStateProps {
  onOpenCamera: () => void;
  onUploadImage: () => void;
  onDoItLater: () => void;
}

/**
 * WelcomeEmptyState - Overhauled to match the minimalist white design of "Welcome Elena!"
 * Figma. 100% pixel-perfect layout and centered elements.
 */
export const WelcomeEmptyState: React.FC<WelcomeEmptyStateProps> = ({
  onOpenCamera,
  onUploadImage,
  onDoItLater,
}) => {
  const { user } = useUser();
  const displayName = user?.name || 'Elena'; // Default to Elena from Figma if name not set

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Welcome Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.welcomeText}>Welcome {displayName}!</Text>
          <Text style={styles.styleMessage}>Let’s Style Your Day.</Text>
        </View>

        {/* Empty Wardrobe Message Section */}
        <View style={styles.messageSection}>
          <Text style={styles.title}>Add your first wardrobe item</Text>
          <Text style={styles.description}>
            AI will personalize your recommendations once you upload your wardrobe items.
          </Text>
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.cameraButton} 
            onPress={onOpenCamera}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="camera-outline" size={24} color="#000000" style={styles.icon} />
              <Text style={styles.cameraButtonText}>Open Camera</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.uploadButton} 
            onPress={onUploadImage}
            activeOpacity={0.9}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="cloud-upload-outline" size={24} color="#FFFFFF" style={styles.icon} />
              <Text style={styles.uploadButtonText}>Upload Image</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.skipButton} 
            onPress={onDoItLater}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Do this later</Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  greetingSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  welcomeText: {
    ...typography.largeTitle,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  styleMessage: {
    ...typography.title3,
    color: '#636366',
    textAlign: 'center',
  },
  messageSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    ...typography.title2,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    ...typography.subheadline,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 15,
  },
  actionsContainer: {
    width: '100%',
    gap: 16,
    alignItems: 'center',
  },
  cameraButton: {
    width: width * 0.75,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow/Border
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cameraButtonText: {
    ...typography.headline,
    color: '#000000',
  },
  uploadButton: {
    width: width * 0.75,
    height: 64,
    backgroundColor: '#000000',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  uploadButtonText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  skipButton: {
    marginTop: 20,
    paddingVertical: 10,
  },
  skipText: {
    ...typography.subheadline,
    color: '#636366',
    textAlign: 'center',
  },
});
