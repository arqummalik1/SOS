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
import { OnboardingMosaic } from '../../components/layout/OnboardingMosaic';

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
      <OnboardingMosaic />

      {/* Bottom Content Card */}
      <View style={styles.bottomCard}>
        {/* Branding Section */}
        <View style={styles.brandContainer}>
          <Image 
            source={require('../../../assets/logos/Group 1586.png')} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
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
  logoImage: {
    width: width * 0.45,
    height: height * 0.12,
    tintColor: '#000000',
  },
  tagline: {
    fontFamily: fontNames.regular,
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: Dimensions.get('window').width * 0.8,
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
