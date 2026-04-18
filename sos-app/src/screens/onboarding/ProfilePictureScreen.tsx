import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';
import { ApiError } from '../../api/errors';
import { userService } from '../../services/userService';
import { notify } from '../../utils/notify';

interface ProfilePictureScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

/**
 * ProfilePictureScreen — Live camera with real front/back switching.
 *
 * Controls (bottom pill bar):
 *   [Gallery]   [Shutter]   [Flip Camera]
 *
 * On capture → auto-navigates to ProfileSetup with the photo URI.
 */
export const ProfilePictureScreen: React.FC<ProfilePictureScreenProps> = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const shutterScale = useRef(new Animated.Value(1)).current;
  const [isUploading, setIsUploading] = useState(false);

  const uploadAndContinue = async (uri: string, source: 'camera' | 'gallery') => {
    const filename = uri.split('/').pop();
    console.log('[SOS_PROFILE_IMAGE] screen: starting upload pipeline', {
      source,
      filename,
      platform: Platform.OS,
    });

    try {
      setIsUploading(true);
      const uploadResult = await userService.uploadProfileImage(uri);
      console.log('[SOS_PROFILE_IMAGE] screen: upload finished, navigating to ProfileSetup', {
        serverMessage: uploadResult.message,
        usingServerUrl: Boolean(uploadResult.profileImageUrl),
      });
      notify({ type: 'success', message: uploadResult.message });
      navigation.navigate('ProfileSetup', {
        profileImage: uploadResult.profileImageUrl ?? uri,
      });
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('[SOS_PROFILE_IMAGE] screen: upload error', {
          code: error.code,
          status: error.status,
          message: error.message,
          details: error.details,
        });
      } else {
        console.error('[SOS_PROFILE_IMAGE] screen: upload error', error);
      }
      const message = error instanceof Error ? error.message : 'Failed to upload profile image.';
      notify({ type: 'error', message });
    } finally {
      setIsUploading(false);
    }
  };

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
    if (isUploading) return;
    console.log('[SOS_PROFILE_IMAGE] screen: shutter pressed (camera capture)');
    animateShutter();

    if (!cameraRef.current) {
      console.warn('[SOS_PROFILE_IMAGE] screen: camera ref missing');
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: Platform.OS === 'android' ? 0.65 : 0.75,
        skipProcessing: Platform.OS === 'android',
      });

      if (photo?.uri) {
        console.log('[SOS_PROFILE_IMAGE] screen: capture OK', {
          width: photo.width,
          height: photo.height,
          filename: photo.uri.split('/').pop(),
        });
        await uploadAndContinue(photo.uri, 'camera');
      } else {
        console.warn('[SOS_PROFILE_IMAGE] screen: capture returned no uri');
      }
    } catch (error) {
      console.error('[SOS_PROFILE_IMAGE] screen: capture failed', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  /* ── Gallery picker ── */
  const openGallery = async () => {
    if (isUploading) return;
    console.log('[SOS_PROFILE_IMAGE] screen: gallery picker opened');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== ImagePicker.PermissionStatus.GRANTED) {
      console.warn('[SOS_PROFILE_IMAGE] screen: gallery permission denied', {
        status: perm.status,
        accessPrivileges: perm.accessPrivileges,
      });
      Alert.alert('Permission Needed', 'Photo library access is required to select a profile picture.');
      return;
    }

    let result: ImagePicker.ImagePickerResult;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: Platform.OS === 'ios',
        aspect: Platform.OS === 'ios' ? [3, 4] : [3, 4],
        quality: 0.85,
        ...(Platform.OS === 'ios'
          ? {
              preferredAssetRepresentationMode:
                ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
            }
          : {}),
      });
    } catch (error) {
      console.error('[SOS_PROFILE_IMAGE] screen: gallery launch failed', error);
      Alert.alert('Error', 'Could not open your photo library. Please try again.');
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
          console.log(
            '[SOS_PROFILE_IMAGE] screen: recovered Android picker result after activity restart'
          );
          result = pending;
        } else if (pending && typeof pending === 'object' && 'code' in pending) {
          console.warn('[SOS_PROFILE_IMAGE] screen: Android picker error payload', pending);
        }
      } catch (e) {
        console.warn('[SOS_PROFILE_IMAGE] screen: getPendingResultAsync', e);
      }
    }

    if (result.canceled) {
      console.log('[SOS_PROFILE_IMAGE] screen: gallery selection canceled');
      return;
    }

    const asset = result.assets[0];
    if (asset?.uri) {
      console.log('[SOS_PROFILE_IMAGE] screen: gallery asset selected', {
        filename: asset.uri.split('/').pop(),
        width: asset.width,
        height: asset.height,
        type: asset.type,
      });
      await uploadAndContinue(asset.uri, 'gallery');
    } else {
      console.warn('[SOS_PROFILE_IMAGE] screen: gallery returned no asset uri');
    }
  };

  /* ── Toggle front / back ── */
  const toggleCamera = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  /* ── Permission states ── */
  if (!permission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Loading camera…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Access</Text>
        <Text style={styles.permissionText}>
          We need camera access to capture your profile photo.
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile picture</Text>
      </View>

      <Text style={styles.subtitle}>Capture your profile image on a plain background</Text>

      {/* Camera Preview */}
      <View style={styles.previewContainer}>
        <View style={styles.cameraContainer}>
          {isFocused && (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
            />
          )}
          {renderGridOverlay()}
        </View>
      </View>

      {/* Bottom Controls */}
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

      {isUploading ? (
        <View style={styles.uploadingOverlay} pointerEvents="none">
          <View style={styles.uploadingCard}>
            <ActivityIndicator size="small" color="#111111" />
            <Text style={styles.uploadingText}>Uploading profile image...</Text>
          </View>
        </View>
      ) : null}

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
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadingText: {
    fontFamily: fontNames.medium,
    fontSize: 14,
    color: '#111111',
  },
});
