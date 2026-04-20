import React, { useRef, useState } from 'react';
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
import { useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';
import { notify } from '../../utils/notify';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function isRecoverableCameraReadinessError(error: unknown): boolean {
  const err = error as { code?: string; message?: string };
  if (err?.code === 'ERR_CAMERA_NOT_READY') {
    return true;
  }
  const m = typeof err?.message === 'string' ? err.message : '';
  return (
    m.includes('ERR_CAMERA_NOT_READY') ||
    m.includes('does not have enough camera data') ||
    m.includes('MediaStream is not ready')
  );
}

export type SosProfileStyleCameraHeaderMode = 'profile' | 'modal';

export type SosProfileStyleCameraProps = {
  title: string;
  subtitle: string;
  headerMode?: SosProfileStyleCameraHeaderMode;
  permissionTitle?: string;
  permissionBody?: string;
  /** After capture or gallery pick (local file URI). */
  onPickedImage: (uri: string, source: 'camera' | 'gallery') => void | Promise<void>;
  /** Modal header: back control */
  onRequestClose?: () => void;
  isProcessing?: boolean;
  processingMessage?: string;
};

/**
 * Same camera UX as onboarding profile picture: rounded preview, rule-of-thirds grid,
 * gallery + shutter + flip on the gray pill bar. CameraView has no children (grid is a sibling overlay)
 * so `takePictureAsync` works reliably on Expo Camera.
 */
export const SosProfileStyleCamera: React.FC<SosProfileStyleCameraProps> = ({
  title,
  subtitle,
  headerMode = 'profile',
  permissionTitle = 'Camera Access',
  permissionBody = 'We need camera access to capture your photo.',
  onPickedImage,
  onRequestClose,
  isProcessing = false,
  processingMessage = 'Please wait…',
}) => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const shutterScale = useRef(new Animated.Value(1)).current;

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

  const takePicture = async () => {
    if (isProcessing) {
      return;
    }
    animateShutter();
    if (!cameraRef.current) {
      notify({ type: 'error', message: 'Camera is not ready yet. Try again in a moment.' });
      return;
    }

    const options = {
      quality: Platform.OS === 'android' ? 0.85 : 0.75,
      // Keep Android captures fully processed so the URI remains stable after camera unmount/navigation.
      skipProcessing: false,
    };

    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        if (!cameraRef.current) {
          break;
        }
        const photo = await cameraRef.current.takePictureAsync(options);
        if (photo?.uri) {
          await Promise.resolve(onPickedImage(photo.uri, 'camera'));
          return;
        }
      } catch (error) {
        if (attempt < 4 && isRecoverableCameraReadinessError(error)) {
          await sleep(160 * (attempt + 1));
          continue;
        }
        console.error('[SosProfileStyleCamera] capture failed', error);
        notify({
          type: 'error',
          message:
            'Could not capture this frame. Wait for the live preview to settle, then try again or use Gallery.',
        });
        return;
      }
      if (attempt < 4) {
        await sleep(160 * (attempt + 1));
      }
    }

    notify({
      type: 'error',
      message: 'Could not get a photo from the camera. Use Gallery or try again in a second.',
    });
  };

  const openGallery = async () => {
    if (isProcessing) {
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== ImagePicker.PermissionStatus.GRANTED) {
      Alert.alert('Permission Needed', 'Photo library access is required to select a photo.');
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
      console.error('[SosProfileStyleCamera] gallery launch failed', error);
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
          result = pending;
        }
      } catch (e) {
        console.warn('[SosProfileStyleCamera] getPendingResultAsync', e);
      }
    }

    if (result.canceled) {
      return;
    }
    const asset = result.assets[0];
    if (asset?.uri) {
      await Promise.resolve(onPickedImage(asset.uri, 'gallery'));
    }
  };

  const toggleCamera = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

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
        <Text style={styles.permissionTitle}>{permissionTitle}</Text>
        <Text style={styles.permissionText}>{permissionBody}</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderGridOverlay = () => (
    <View style={styles.gridOverlay} pointerEvents="none">
      <View style={[styles.gridLine, styles.gridLineVertical, { left: '33.33%' }]} />
      <View style={[styles.gridLine, styles.gridLineVertical, { left: '66.66%' }]} />
      <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '33.33%' }]} />
      <View style={[styles.gridLine, styles.gridLineHorizontal, { top: '66.66%' }]} />
    </View>
  );

  const headerProfile = (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );

  const headerModal = (
    <View style={[styles.topBar, { paddingTop: Math.max(insets.top + 8, 56) }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onRequestClose}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={24} color="#000000" />
      </TouchableOpacity>
      <Text style={styles.headerTitleModal}>{title}</Text>
      <View style={styles.topBarSpacer} />
    </View>
  );

  return (
    <View style={styles.container}>
      {headerMode === 'modal' ? headerModal : headerProfile}

      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.previewContainer}>
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={facing}
            active={isFocused}
            onMountError={({ message }) => {
              console.error('[SosProfileStyleCamera] mount error', message);
              notify({ type: 'error', message: message || 'Camera could not start.' });
            }}
          />
          {renderGridOverlay()}
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.controlsBar}>
          <TouchableOpacity style={styles.actionIconButton} onPress={openGallery} disabled={isProcessing}>
            <Image
              source={require('../../../assets/camera/GalleryIcon.png')}
              style={styles.actionIconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shutterButtonContainer}
            onPress={takePicture}
            disabled={isProcessing}
          >
            <Animated.Image
              source={require('../../../assets/camera/CaptureIcon.png')}
              style={[styles.shutterImage, { transform: [{ scale: shutterScale }] }]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionIconButton} onPress={toggleCamera} disabled={isProcessing}>
            <Image
              source={require('../../../assets/camera/CameraIcon.png')}
              style={styles.actionIconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {isProcessing ? (
        <View style={styles.uploadingOverlay} pointerEvents="auto">
          <View style={styles.uploadingCard}>
            <ActivityIndicator size="small" color="#111111" />
            <Text style={styles.uploadingText}>{processingMessage}</Text>
          </View>
        </View>
      ) : null}

      <View
        style={{
          height:
            headerMode === 'modal' ? Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10) : Platform.OS === 'ios' ? 20 : 10,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarSpacer: {
    width: 44,
  },
  headerTitleModal: {
    flex: 1,
    fontSize: typography.title1.fontSize,
    fontFamily: fontNames.bold,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.subheadline.fontSize,
    fontFamily: fontNames.regular,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 24,
  },

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
