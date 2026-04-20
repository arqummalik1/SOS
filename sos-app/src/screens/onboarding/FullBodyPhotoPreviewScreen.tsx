import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { fontNames } from '../../theme/fonts';
import { userService } from '../../services/userService';
import { notify } from '../../utils/notify';

const { width } = Dimensions.get('window');

interface FullBodyPhotoPreviewScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any, 'FullBodyPhotoPreview'>;
}

/**
 * FullBodyPhotoPreviewScreen - Replicates "Profile setup 1.2.png" with 100% visual fidelity.
 * Shows a large preview of the uploaded full-body photo.
 */
export const FullBodyPhotoPreviewScreen: React.FC<FullBodyPhotoPreviewScreenProps> = ({ navigation, route }) => {
  const fullBodyImage = route.params?.fullBodyImage;
  const profileData = route.params?.profileData || {};
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleLookGood = async () => {
    if (!fullBodyImage) {
      notify({ type: 'error', message: 'No full-body image to upload' });
      return;
    }

    setIsUploading(true);
    try {
      const result = await userService.uploadFullBodyImage(fullBodyImage);
      if (!result.success) {
        throw new Error(result.message || 'Failed to upload full-body image.');
      }
      notify({ type: 'success', message: result.message });
      navigation.navigate('BodyMeasurements', { profileData });
    } catch (error) {
      console.error('[SOS_FULL_BODY_PREVIEW] Upload error:', error);
      notify({
        type: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to upload full-body image. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeContainer style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress Bar (3 segments, 1st active) */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressSegment, styles.segmentActive]} />
          <View style={[styles.progressSegment, styles.segmentInactive]} />
          <View style={[styles.progressSegment, styles.segmentInactive]} />
        </View>

        {/* Title Section */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Full body photo</Text>
          <Text style={styles.subtitle}>
            This information helps us deliver a better, more personalized experience for you.
          </Text>
        </View>

        {/* Large Preview Image Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoWrapper}>
            {/* Loading placeholder */}
            {imageLoading && !imageError && (
              <View style={[styles.previewImage, styles.imageLoadingPlaceholder]}>
                <ActivityIndicator color="#666666" size="large" />
                <Text style={styles.loadingText}>Loading image...</Text>
              </View>
            )}
            {/* Error state */}
            {imageError && !fullBodyImage && (
              <View style={[styles.previewImage, styles.imageErrorPlaceholder]}>
                <Ionicons name="image-outline" size={48} color="#999999" />
                <Text style={styles.errorText}>No image selected</Text>
              </View>
            )}
            {/* Actual image with error handling */}
            <Image
              source={fullBodyImage && !imageError ? { uri: fullBodyImage } : require('../../../assets/images/mosaic/fashion1.jpg')}
              style={[
                styles.previewImage,
                (imageLoading || (imageError && !fullBodyImage)) && styles.imageHidden,
              ]}
              resizeMode="cover"
              onLoadStart={() => {
                setImageLoading(true);
                setImageError(false);
              }}
              onLoadEnd={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
                console.error('[SOS_FULL_BODY_IMAGE] Failed to load image:', fullBodyImage);
              }}
            />
            {/* Edit Icon Badge */}
            <TouchableOpacity style={styles.editIconBadge} activeOpacity={0.8}>
              <View style={styles.editIconCircle}>
                <Ionicons name="pencil" size={16} color="#000000" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.lookGoodButton}
            onPress={handleLookGood}
            activeOpacity={0.9}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Look's Good</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  progressSegment: {
    width: (width - 48 - 24) / 4,
    height: 12,
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: '#000000',
  },
  segmentInactive: {
    backgroundColor: '#E5E5EA',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  title: {
    fontFamily: fontNames.bold,
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontNames.regular,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 60,
    width: '100%',
  },
  photoWrapper: {
    borderRadius: 28,
    backgroundColor: '#F2F2F7',
    // High fidelity shadow matching design
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  previewImage: {
    width: width * 0.82,
    height: width * 1.15, // Aspect ratio matching full-body photo
    borderRadius: 28,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  editIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContainer: {
    width: '100%',
  },
  lookGoodButton: {
    backgroundColor: '#111111',
    width: '100%',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    fontFamily: fontNames.medium,
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  imageHidden: {
    opacity: 0,
  },
  imageLoadingPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: fontNames.regular,
    fontSize: 14,
    color: '#666666',
  },
  imageErrorPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontFamily: fontNames.regular,
    fontSize: 14,
    color: '#999999',
  },
});
