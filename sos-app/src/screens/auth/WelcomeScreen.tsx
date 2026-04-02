import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E8D5E8', '#D4B8D4', '#C8A8C8']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header - Work Outfit Dropdown */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>Work outfit</Text>
            <Ionicons name="chevron-down" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Main Content Container */}
        <View style={styles.mainContent}>
          {/* Large MODERN MUSE Text - Behind Model */}
          <View style={styles.titleContainer}>
            <Text style={styles.modernMuseText}>MODERN MUSE</Text>
          </View>

          {/* Model Image Container */}
          <View style={styles.modelContainer}>
            <Image
              source={require('../../../assets/VirtualTryOn/Frame 1000006731.png')}
              style={styles.modelImage}
              resizeMode="contain"
            />
          </View>

          {/* Clothing Items - Right Side */}
          <View style={styles.clothingPanel}>
            <View style={styles.clothingItem}>
              <Image
                source={require('../../../assets/VirtualTryOn/sugggestion1.png')}
                style={styles.clothingImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.clothingItem}>
              <Image
                source={require('../../../assets/VirtualTryOn/suggestion2.png')}
                style={styles.clothingImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.clothingItem}>
              <Image
                source={require('../../../assets/VirtualTryOn/suggestion3.png')}
                style={styles.clothingImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.clothingItem}>
              <Image
                source={require('../../../assets/VirtualTryOn/suggestios.png')}
                style={styles.clothingImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity style={styles.refreshButton}>
          <View style={styles.refreshCircle}>
            <Ionicons name="refresh" size={24} color="#9B7BA0" />
          </View>
        </TouchableOpacity>

        {/* Expand Indicator */}
        <View style={styles.expandContainer}>
          <Ionicons name="chevron-down" size={28} color="#666" />
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0E8F0',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  dropdownText: {
    fontFamily: fontNames.medium,
    fontSize: 16,
    color: '#333333',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    position: 'relative',
  },
  titleContainer: {
    position: 'absolute',
    top: '15%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
  modernMuseText: {
    fontFamily: fontNames.bold,
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    position: 'relative',
  },
  modelImage: {
    width: width * 0.75,
    height: height * 0.55,
    marginTop: 40,
  },
  clothingPanel: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginRight: 15,
    zIndex: 3,
  },
  clothingItem: {
    width: 70,
    height: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clothingImage: {
    width: 50,
    height: 50,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    zIndex: 10,
  },
  refreshCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  expandContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
