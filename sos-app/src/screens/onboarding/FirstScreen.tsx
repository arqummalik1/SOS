import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fontNames } from '../../theme/fonts';
import { typography } from '../../theme/typography';

const { width, height } = Dimensions.get('window');

interface FirstScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

/**
 * FirstScreen - Pixel-perfect replication of the SOS Welcome Screen.
 * Design follows the requested Kyiv Sans typography and exact layout hierarchy.
 */
export const FirstScreen: React.FC<FirstScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background Mosaic - Dynamic image grid */}
      <View style={styles.mosaicContainer}>
        {/* Row 1 */}
        <View style={styles.row}>
          <Image 
            source={require('../../../assets/images/mosaic/fashion1.jpg')} 
            style={[styles.mosaicImage, styles.imgR1L]} 
            resizeMode="cover" 
          />
          <Image 
            source={require('../../../assets/images/mosaic/fashion2.jpg')} 
            style={[styles.mosaicImage, styles.imgR1R]} 
            resizeMode="cover" 
          />
        </View>
        
        {/* Row 2 */}
        <View style={styles.row}>
          <Image 
            source={require('../../../assets/images/mosaic/fashion4.jpg')} 
            style={[styles.mosaicImage, styles.imgR2L]} 
            resizeMode="cover" 
          />
          <Image 
            source={require('../../../assets/images/mosaic/fashion3.jpg')} 
            style={[styles.mosaicImage, styles.imgR2C]} 
            resizeMode="cover" 
          />
          <Image 
            source={require('../../../assets/images/mosaic/fashion5.jpg')} 
            style={[styles.mosaicImage, styles.imgR2R]} 
            resizeMode="cover" 
          />
        </View>

        {/* Row 3 (Partially covered by card) */}
        <View style={styles.row}>
          <Image 
            source={require('../../../assets/images/mosaic/fashion6.jpg')} 
            style={[styles.mosaicImage, styles.imgR3L]} 
            resizeMode="cover" 
          />
          <Image 
            source={require('../../../assets/images/mosaic/fashion2.jpg')} 
            style={[styles.mosaicImage, styles.imgR3R]} 
            resizeMode="cover" 
          />
        </View>
      </View>

      {/* Bottom Content Card */}
      <View style={styles.bottomCard}>
        {/* Branding Section */}
        <View style={styles.brandContainer}>
          <Text style={styles.sosLogo}>SOS</Text>
          <Text style={styles.styleOnSpot}>Style On Spot</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>
          {'Where Elegance Meets Everyday\nDressing.'}
        </Text>

        <View style={styles.spacer} />

        {/* Actions */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate('SignIn')}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.loginContainer}
            onPress={() => navigation.navigate('SignIn')}
            activeOpacity={0.7}
          >
            <Text style={styles.accountText}>Already have an account? </Text>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mosaicContainer: {
    height: height * 0.6,
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
    backgroundColor: '#F7F7F7',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 12,
    width: width * 1.2, // Slightly wider row for overlapping feel
    paddingHorizontal: 8,
  },
  mosaicImage: {
    borderRadius: 28,
    backgroundColor: '#EEEEEE',
  },
  // Exact Image sizing for Pixel-Perfection
  imgR1L: {
    width: width * 0.48,
    height: height * 0.22,
    marginRight: 12,
  },
  imgR1R: {
    width: width * 0.52,
    height: height * 0.22,
  },
  imgR2L: {
    width: width * 0.12,
    height: height * 0.2,
    marginRight: 12,
    marginLeft: -width * 0.05, // Negative margin to create edge cutout feel
  },
  imgR2C: {
    width: width * 0.5,
    height: height * 0.2,
    marginRight: 12,
  },
  imgR2R: {
    width: width * 0.4,
    height: height * 0.2,
  },
  imgR3L: {
    width: width * 0.4,
    height: height * 0.2,
    marginRight: 12,
  },
  imgR3R: {
    width: width * 0.5,
    height: height * 0.2,
  },

  // Bottom Card implementation
  bottomCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    marginTop: -height * 0.1, // Overlaps the mosaic section
    paddingHorizontal: 30,
    paddingTop: height * 0.06,
    alignItems: 'center',

    // Premium Elevation
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 15,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  sosLogo: {
    ...typography.largeTitle,
    color: '#000000',
    lineHeight: 80,
    textAlign: 'center',
  },
  styleOnSpot: {
    ...typography.title3,
    color: '#000000',
    marginTop: -6,
  },
  tagline: {
    ...typography.callout,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  spacer: {
    flex: 1,
  },
  actionSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 48 : 32,
  },
  primaryButton: {
    backgroundColor: '#0A0A0A',
    width: width - 64,
    height: 62,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    // Button Shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    ...typography.headline,
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  accountText: {
    ...typography.subheadline,
    color: '#666666',
  },
  loginLink: {
    ...typography.subheadline,
    color: '#000000',
    textDecorationLine: 'underline',
  },
});
