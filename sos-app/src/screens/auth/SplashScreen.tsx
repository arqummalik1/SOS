import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MosaicBackground } from '../../components/layout/MosaicBackground';
import { GlassBottomSheet } from '../../components/ui/GlassBottomSheet';
import { GlassButton } from '../../components/ui/GlassButton';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface SplashScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <MosaicBackground />
      <GlassBottomSheet variant="light" height={360}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>SOS</Text>
            <Text style={styles.subtitle}>Style On Spot</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.tagline}>
            "Where Elegance Meets Everyday Dressing."
          </Text>

          <View style={styles.buttonContainer}>
            <GlassButton
              title="Get Started"
              onPress={() => navigation.navigate('SignIn')}
              variant="solid"
            />
          </View>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </GlassBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -2,
    color: '#000000',
  },
  subtitle: {
    fontSize: typography.caption1.fontSize,
    color: '#666666',
    marginTop: 4,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: spacing.lg,
  },
  tagline: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    color: '#333333',
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  loginLink: {
    marginTop: spacing.md,
  },
  loginText: {
    fontSize: typography.footnote.fontSize,
    color: '#666666',
  },
  loginBold: {
    fontWeight: '600',
    color: '#000000',
  },
});
