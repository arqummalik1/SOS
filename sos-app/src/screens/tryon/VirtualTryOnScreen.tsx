import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

const { width, height } = Dimensions.get('window');

interface VirtualTryOnScreenProps {
  navigation: NativeStackNavigationProp<any>;
  route?: any;
}

export const VirtualTryOnScreen: React.FC<VirtualTryOnScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [showOutfit, setShowOutfit] = useState(true);
  const [saved, setSaved] = useState(false);
  
  const outfit = route?.params?.outfit || {
    id: '1',
    name: 'Summer Casual',
    image: 'https://example.com/outfit.png',
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    setSaved(!saved);
  };

  const toggleOutfit = () => {
    setShowOutfit(!showOutfit);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera" size={64} color="#7C3AED" />
        <Text style={styles.permissionText}>We need your permission to use the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      <CameraView style={styles.camera} facing={facing}>
        {/* Overlay Controls */}
        <View style={styles.overlay}>
          {/* Top Controls */}
          <View style={styles.topControls}>
            <TouchableOpacity style={styles.controlButton} onPress={handleClose}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, saved && styles.controlButtonActive]} 
              onPress={handleSave}
            >
              <Ionicons 
                name={saved ? "heart" : "heart-outline"} 
                size={28} 
                color={saved ? "#FF375F" : "#FFFFFF"} 
              />
            </TouchableOpacity>
          </View>

          {/* Outfit Preview Overlay */}
          {showOutfit && (
            <Animated.View style={styles.outfitOverlay}>
              <View style={styles.outfitCard}>
                <Image 
                  source={{ uri: outfit.image }} 
                  style={styles.outfitImage}
                  resizeMode="contain"
                />
                <Text style={styles.outfitName}>{outfit.name}</Text>
              </View>
            </Animated.View>
          )}

          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.controlButton} onPress={toggleOutfit}>
              <Ionicons 
                name={showOutfit ? "eye" : "eye-off"} 
                size={24} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.captureButton}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
              <Ionicons name="camera-reverse" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  permissionText: {
    fontSize: 18,
    color: '#374151',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    padding: 16,
  },
  closeButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  outfitOverlay: {
    position: 'absolute',
    bottom: 180,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  outfitCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  outfitImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  outfitName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },
});
