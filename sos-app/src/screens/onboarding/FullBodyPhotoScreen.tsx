import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');
const PREVIEW_WIDTH = width - 48;
const PREVIEW_HEIGHT = PREVIEW_WIDTH * 1.4;

interface FullBodyPhotoScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const FullBodyPhotoScreen: React.FC<FullBodyPhotoScreenProps> = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const shutterScale = useRef(new Animated.Value(1)).current;

  const animateShutter = () => {
    Animated.sequence([
      Animated.timing(shutterScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shutterScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const takePicture = async () => {
    animateShutter();
    const mockImageUri = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400';
    setSelectedImage(mockImageUri);
    setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }, 500);
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need gallery permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }, 500);
    }
  };

  const toggleCamera = () => {
    setCameraFacing(current => current === 'back' ? 'front' : 'back');
  };

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
        <Text style={styles.headerTitle}>Full body picture</Text>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Please capture your full body photo on a plain background</Text>

      {/* Camera Preview */}
      <View style={styles.previewContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.cameraContainer}>
            <View style={styles.cameraPlaceholder}>
              <Ionicons name="body" size={48} color="#666666" />
            </View>
            {renderGridOverlay()}
          </View>
        )}
      </View>

      {/* Camera Controls */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlsBar}>
          {/* Gallery Button */}
          <TouchableOpacity style={styles.controlButton} onPress={openGallery}>
            <View style={styles.iconCircle}>
              <Ionicons name="images" size={24} color="#666666" />
            </View>
          </TouchableOpacity>

          {/* Shutter Button */}
          <TouchableOpacity style={styles.shutterButtonContainer} onPress={takePicture}>
            <Animated.View style={[styles.shutterButton, { transform: [{ scale: shutterScale }] }]}>
              <View style={styles.shutterInner} />
            </Animated.View>
          </TouchableOpacity>

          {/* Switch Camera Button */}
          <TouchableOpacity style={styles.controlButton} onPress={toggleCamera}>
            <View style={styles.iconCircle}>
              <Ionicons name="camera-reverse" size={24} color="#666666" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Safe Area */}
      <View style={styles.bottomSafeArea} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  previewContainer: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  cameraContainer: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: PREVIEW_WIDTH,
    height: PREVIEW_HEIGHT,
    borderRadius: 28,
    resizeMode: 'cover',
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
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    backgroundColor: '#F2F2F7',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButtonContainer: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  shutterInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  bottomSafeArea: {
    height: 20,
  },
});
