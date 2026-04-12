import React from 'react';
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
  useWindowDimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeContainer } from '../../components/layout/SafeContainer';
import { fontNames } from '../../theme/fonts';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

interface FullBodyPhotoPreviewScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'FullBodyPhotoPreview'>;
  route: RouteProp<AuthStackParamList, 'FullBodyPhotoPreview'>;
}

/**
 * FullBodyPhotoPreviewScreen — Pixel-perfect match for "Profile setup 1.2.png".
 * Responsive update: Dimensions calculated dynamically inside component.
 */
export const FullBodyPhotoPreviewScreen: React.FC<FullBodyPhotoPreviewScreenProps> = ({ navigation, route }) => {
  const { width, height: screenHeight } = useWindowDimensions();
  
  // Dimensions math:
  // Figma margins: 20px each side
  const IMAGE_WIDTH = width - 40;
  // Figma ratio: 671/390 ≈ 1.72
  // User requested 10% reduction from that exact ratio for better device fitting
  const IMAGE_HEIGHT = (IMAGE_WIDTH * (671 / 390)) * 0.9;

  const fullBodyImage = route.params?.fullBodyImage;
  const profileImage = route.params?.profileImage;
  const profileData = route.params?.profileData;

  const handleLooksGood = () => {
    navigation.navigate('BodyMeasurements', {
      profileData: {
        ...profileData,
        profileImage,
        fullBodyImage,
      },
    });
  };

  const handleEditPhoto = () => {
    navigation.navigate('FullBodyCamera', { profileImage, profileData });
  };

  return (
    <SafeContainer style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* ── Progress Bar (3 segments, 1st active) ── */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressSegment, styles.segmentActive]} />
          <View style={[styles.progressSegment, styles.segmentInactive]} />
          <View style={[styles.progressSegment, styles.segmentInactive]} />
        </View>

        {/* ── Header ── */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>Full body photo</Text>
          <Text style={styles.subtitle}>
            This information helps us deliver a better,{'\n'}more personalized experience for you.
          </Text>
        </View>

        {/* ── Photo Preview (tall rectangle with edit badge) ── */}
        <View style={styles.photoSection}>
          <View style={[styles.photoWrapper, { width: IMAGE_WIDTH, height: IMAGE_HEIGHT }]}>
            <Image
              source={
                fullBodyImage
                  ? { uri: fullBodyImage }
                  : require('../../../assets/images/mosaic/fashion1.jpg')
              }
              style={styles.previewImage}
              resizeMode="cover"
            />
            {/* Edit badge — bottom-right */}
            <TouchableOpacity
              style={styles.editBadge}
              activeOpacity={0.8}
              onPress={handleEditPhoto}
            >
              <View style={styles.editBadgeCircle}>
                <Ionicons name="pencil-outline" size={16} color="#000000" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Look's Good Button ── */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.looksGoodButton}
            onPress={handleLooksGood}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Look's Good</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 20, // Figma: 20px padding each side
    paddingTop: 16,
    paddingBottom: 48,
  },

  /* ── Progress bar ── */
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  progressSegment: {
    flex: 1,
    height: 10,
    borderRadius: 5,
  },
  segmentActive: {
    backgroundColor: '#000000',
  },
  segmentInactive: {
    backgroundColor: '#E5E5EA',
  },

  /* ── Header ── */
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: fontNames.bold,
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fontNames.regular,
    fontSize: 14,
    lineHeight: 21,
    color: '#666666',
    textAlign: 'center',
  },

  /* ── Photo section ── */
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  photoWrapper: {
    borderRadius: 24,
    overflow: 'visible',
    // Subtle shadow for the photo card
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
  },
  editBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
  editBadgeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  /* ── Button ── */
  buttonContainer: {
    alignItems: 'center',
  },
  looksGoodButton: {
    backgroundColor: '#0A0A0A',
    width: '75%',
    height: 58,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    fontFamily: fontNames.medium,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
