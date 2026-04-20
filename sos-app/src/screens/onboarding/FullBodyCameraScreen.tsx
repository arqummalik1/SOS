import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { notify } from '../../utils/notify';

interface FullBodyCameraScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'FullBodyCamera'>;
  route: RouteProp<AuthStackParamList, 'FullBodyCamera'>;
}

/**
 * FullBodyCameraScreen — Same layout as ProfilePictureScreen but with
 * "Full body photo" heading. Reuses the exact same camera area, controls
 * bar (Gallery / Shutter / Flip), and grid overlay.
 *
 * On capture → auto-navigates to FullBodyPhotoPreview with the photo URI.
 */
export const FullBodyCameraScreen: React.FC<FullBodyCameraScreenProps> = ({ navigation, route }) => {
  const isFocused = useIsFocused();
  const profileImage = route.params?.profileImage;
  const profileData = route.params?.profileData;

  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const shutterScale = useRef(new Animated.Value(1)).current;

  /* ── Shutter animation ── */
  const animateShutter = () => {
    Animated.sequence([
      Animated.timing(shutterScale, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(shutterScale, {
        toValue: 1,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /* ── Take picture ── */
  const takePicture = async () => {
    animateShutter();

    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: Platform.OS === 'android' ? 0.85 : 0.75,
        // Android + skipProcessing:true: URI can be tied to the camera session / cache; navigating
        // away unmounts CameraView before FullBodyPhotoPreview finishes loading → blank (white) image.
        skipProcessing: false,
      });

      if (photo?.uri) {
        navigation.navigate('FullBodyPhotoPreview', {
          fullBodyImage: photo.uri,
          profileImage,
          profileData,
        });
      }
    } catch (error) {
      notify({ type: 'error', message: 'Failed to capture image. Please try again.' });
    }
  };

  /* ── Gallery picker (9:16 applied on upload via image manipulator) ── */
  const openGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== ImagePicker.PermissionStatus.GRANTED) {
      notify({
        type: 'error',
        title: 'Permission Needed',
        message: 'Photo library access is required to select a full body photo.',
      });
      return;
    }

    let result: ImagePicker.ImagePickerResult;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.85,
        ...(Platform.OS === 'ios'
          ? {
              preferredAssetRepresentationMode:
                ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
            }
          : {}),
      });
    } catch (error) {
      console.error('[SOS_FULL_BODY_IMAGE] gallery launch failed', error);
      notify({
        type: 'error',
        message: 'Could not open your photo library. Please try again.',
      });
      return;
    }

    if (Platform.OS === 'android') {
      try {
        const pending = await ImagePicker.getPendingResultAsync();
        if (
          pending &&
          typeof pending === 'object' &&
          'canceled' in pending &&
          pending.canceled === false &&
          pending.assets &&
          pending.assets.length > 0 &&
          (result.canceled || !result.assets?.length)
        ) {
          result = pending as ImagePicker.ImagePickerSuccessResult;
        }
      } catch (e) {
        console.warn('[SOS_FULL_BODY_IMAGE] getPendingResultAsync', e);
      }
    }

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    navigation.navigate('FullBodyPhotoPreview', {
      fullBodyImage: result.assets[0].uri,
      profileImage,
      profileData,
    });
  };

  /* ── Toggle front / back ── */
  const toggleCamera = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  /* ── Permission: loading ── */
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Loading camera…</Text>
      </View>
    );
  }

  /* ── Permission: not granted ── */
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access</Text>
        <Text style={styles.permissionText}>
          We need camera access to capture your full body photo.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* ── Grid overlay ── */
  const renderGridOverlay = () => (
    <View style={styles.gridOverlay} pointerEvents="none">
      <View style={[styles.gridLine, styles.gridLineVertical, { left: '33.33%' }]} />
      <View style={[styles.gridLine, styles.gridLineVertical, { left: '66.66%' }]} />
      <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '33.33%' }]} />
      <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '66.66%' }]} />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header — "Full body photo" instead of "Profile picture" */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Full body photo</Text>
      </View>

      <Text style={styles.subtitle}>Capture your full body image on a plain background</Text>

      {/* Camera Preview */}
      <View style={styles.previewContainer}>
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            active={isFocused}
          />
          {renderGridOverlay()}
        </View>
      </View>

      {/* Bottom Controls — identical to ProfilePictureScreen */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlsBar}>
          {/* Gallery */}
          <TouchableOpacity style={styles.actionIconButton} onPress={openGallery}>
            <Image
              source={require('../../../assets/camera/GalleryIcon.png')}
              style={styles.actionIconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Shutter */}
          <TouchableOpacity style={styles.shutterButtonContainer} onPress={takePicture}>
            <Animated.Image
              source={require('../../../assets/camera/CaptureIcon.png')}
              style={[styles.shutterImage, { transform: [{ scale: shutterScale }] }]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          {/* Flip Camera */}
          <TouchableOpacity style={styles.actionIconButton} onPress={toggleCamera}>
            <Image
              source={require('../../../assets/camera/CameraIcon.png')}
              style={styles.actionIconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomSafeArea} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* ── Permission screens ── */
  permissionContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontFamily: fontNames.bold,
    fontSize: 24,
    color: '#000000',
    marginBottom: 12,
  },
  permissionText: {
    fontFamily: fontNames.regular,
    fontSize: 15,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  permissionButton: {
    backgroundColor: '#0A0A0A',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
  },
  permissionButtonText: {
    fontFamily: fontNames.medium,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  /* ── Header ── */
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: typography.title1.fontSize,
    fontFamily: fontNames.bold,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.subheadline.fontSize,
    fontFamily: fontNames.regular,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
  },

  /* ── Camera preview ── */
  previewContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 21,
    marginBottom: 24,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },

  /* ── Grid overlay ── */
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  gridLineVertical: {
    width: 1,
    height: '100%',
  },
  gridLineHorizontal: {
    width: '100%',
    height: 1,
  },

  /* ── Controls ── */
  controlsContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAEAEA',
    borderRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIconButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconImage: {
    width: '100%',
    height: '100%',
  },
  shutterButtonContainer: {
    width: 68,
    height: 68,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterImage: {
    width: 68,
    height: 68,
  },
  bottomSafeArea: {
    height: Platform.OS === 'ios' ? 20 : 10,
  },
});
