import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { Camera, CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';

const { width } = Dimensions.get('window');
const CAMERA_ASPECT_RATIO = 4 / 3;
const CAMERA_HEIGHT = width * CAMERA_ASPECT_RATIO;

/**
 * AddItemCameraScreen - Pixel-perfect replication of the Add Item design.
 * Features a 3x3 compositional grid and glassmorphic controls.
 */
export const AddItemCameraScreen: React.FC = () => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const navigation = useNavigation<any>();

  // Constants for easy modification
  const icons = {
    gallery: 'image-outline',
    switch: 'camera-reverse-outline',
  };

  useEffect(() => {
    (async () => {
      if (!permission) {
        await requestPermission();
      }
    })();
  }, [permission]);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      console.log('Image picked:', result.assets[0].uri);
    }
  };

  const takePicture = () => {
    // Navigate to Gallery/Items for functional demo as per user's "move to next screen" flow
    navigation.navigate('AddItemGallery');
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Add item</Text>
        <Text style={styles.subtitle}>Capture your clothing on a plain background</Text>
      </View>

      {/* Main Camera Body (Flex: 1 to center the card) */}
      <View style={styles.cameraBody}>
        <View style={styles.cameraContainer}>
          <CameraView 
            ref={cameraRef}
            style={styles.camera} 
            facing={facing}
          >
            {/* 3x3 Grid Overlay */}
            <View style={styles.gridOverlay}>
              {/* Grid implementation is already pixel-perfect */}
              <View style={styles.gridRow}>
                <View style={[styles.gridCell, styles.borderRight, styles.borderBottom]} />
                <View style={[styles.gridCell, styles.borderRight, styles.borderBottom]} />
                <View style={[styles.gridCell, styles.borderBottom]} />
              </View>
              <View style={styles.gridRow}>
                <View style={[styles.gridCell, styles.borderRight, styles.borderBottom]} />
                <View style={[styles.gridCell, styles.borderRight, styles.borderBottom]} />
                <View style={[styles.gridCell, styles.borderBottom]} />
              </View>
              <View style={styles.gridRow}>
                <View style={[styles.gridCell, styles.borderRight]} />
                <View style={[styles.gridCell, styles.borderRight]} />
                <View style={styles.gridCell} />
              </View>
            </View>
          </CameraView>
        </View>
      </View>

      {/* FOOTER: Pixel-Perfect 'Liquid Glass' Pill Refinement */}
      <View style={styles.footer}>
        <View style={styles.pillContainer}>
          {/* Left: Gallery Button (Subtle Circle Indent) */}
          <TouchableOpacity 
            style={styles.sideCircle} 
            onPress={pickImage}
            activeOpacity={0.7}
          >
            <Ionicons name={icons.gallery as any} size={28} color="#909090" />
          </TouchableOpacity>

          {/* Center: Capture Button (Solid White Circle) */}
          <TouchableOpacity 
            style={styles.centerWhiteCircle} 
            onPress={takePicture}
            activeOpacity={0.9}
          >
            {/* No icon: Solid White Capture as per zoom-in reference */}
          </TouchableOpacity>

          {/* Right: Switch Camera Button (Subtle Circle Indent) */}
          <TouchableOpacity 
            style={styles.sideCircle} 
            onPress={toggleCameraFacing}
            activeOpacity={0.7}
          >
            <Ionicons name={icons.switch as any} size={28} color="#909090" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    ...typography.title1,
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    ...typography.subheadline,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  cameraBody: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  cameraContainer: {
    width: width * 0.9,
    aspectRatio: 3 / 4,
    alignSelf: 'center',
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#000000',
    // High-fidelity shadow for elevation
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  camera: {
    flex: 1,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
  },
  gridCell: {
    flex: 1,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.25)',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.25)',
  },
  footer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingTop: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  pillContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: width * 0.85,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#EEEEEE', // Base color for the large pill
    paddingHorizontal: 12,
    // Soft broad shadow seen in the zoom-in
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 6,
    // Extremely subtle border for "etched" feel
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
  },
  sideCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#E8E8E8', // Subtle contrast for side indents
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.01)',
  },
  centerWhiteCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF', // Pure solid white as per zoom-in
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    ...typography.body,
  },
  permissionButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    ...typography.headline,
  },
});
