import React, { useState, useRef, useEffect } from 'react';
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
import { typography } from '../../theme/typography';
import { fontNames } from '../../theme/fonts';

const { width, height } = Dimensions.get('window');
const PREVIEW_SIZE = width - 48;

interface ProfilePictureScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const ProfilePictureScreen: React.FC<ProfilePictureScreenProps> = ({ navigation }) => {
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
    // Simulate taking picture and using placeholder for demo
    const mockImageUri = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';
    setSelectedImage(mockImageUri);
    setTimeout(() => {
      navigation.navigate('ProfileSetup', { profileImage: mockImageUri });
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
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      navigation.navigate('ProfileSetup', { profileImage: result.assets[0].uri });
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile picture</Text>
      </View>

      <Text style={styles.subtitle}>Capture your profile image on a plain background</Text>

      <View style={styles.previewContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.cameraContainer}>
            <View style={styles.cameraPlaceholder}>
              <Ionicons name="camera" size={48} color="#666666" />
            </View>
            {renderGridOverlay()}
          </View>
        )}
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.controlsBar}>
          <TouchableOpacity style={styles.actionIconButton} onPress={openGallery}>
            <Image source={require('../../../assets/camera/GalleryIcon.png')} style={styles.actionIconImage} resizeMode="contain" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.shutterButtonContainer} onPress={takePicture}>
            <Animated.Image source={require('../../../assets/camera/CaptureIcon.png')} style={[styles.shutterImage, { transform: [{ scale: shutterScale }] }]} resizeMode="contain" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionIconButton} onPress={toggleCamera}>
            <Image source={require('../../../assets/camera/CameraIcon.png')} style={styles.actionIconImage} resizeMode="contain" />
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
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 21,
    width: width - 42,
    marginBottom: 24,
  },
  cameraContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
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
    height: 20,
  },
});
