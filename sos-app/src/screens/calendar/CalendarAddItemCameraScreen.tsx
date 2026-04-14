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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';
import { CalendarStackParamList } from '../../navigation/CalendarStackNavigator';

type Props = {
  navigation: NativeStackNavigationProp<CalendarStackParamList, 'CalendarAddItemCamera'>;
};

/**
 * Calendar-only add-item camera: duplicated from ProfilePictureScreen (same layout, assets, controls)
 * so the outfit / calendar flow never depends on the root stack or Auth onboarding routes.
 */
export const CalendarAddItemCameraScreen: React.FC<Props> = ({ navigation }) => {
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
    animateShutter();

    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        skipProcessing: Platform.OS === 'android',
      });

      if (photo?.uri) {
        navigation.navigate('AddItemGallery');
      }
    } catch {
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const openGallery = async () => {
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
      navigation.navigate('AddItemGallery');
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
        <Text style={styles.permissionTitle}>Camera Access</Text>
        <Text style={styles.permissionText}>
          We need camera access to capture photos of your clothing.
        </Text>
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

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top + 8, 56) }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add item</Text>
        <View style={styles.topBarSpacer} />
      </View>

      <Text style={styles.subtitle}>Capture your clothing on a plain background</Text>

      <View style={styles.previewContainer}>
        <View style={styles.cameraContainer}>
          {isFocused && (
            <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
          )}
          {renderGridOverlay()}
        </View>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.controlsBar}>
          <TouchableOpacity style={styles.actionIconButton} onPress={openGallery}>
            <Image
              source={require('../../../assets/camera/GalleryIcon.png')}
              style={styles.actionIconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shutterButtonContainer} onPress={takePicture}>
            <Animated.Image
              source={require('../../../assets/camera/CaptureIcon.png')}
              style={[styles.shutterImage, { transform: [{ scale: shutterScale }] }]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionIconButton} onPress={toggleCamera}>
            <Image
              source={require('../../../assets/camera/CameraIcon.png')}
              style={styles.actionIconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: Math.max(insets.bottom, Platform.OS === 'ios' ? 20 : 10) }} />
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
  headerTitle: {
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
});
