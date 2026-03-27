import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7C3AED', '#6D28D9', '#5B21B6']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
        <View style={[styles.circle, styles.circle4]} />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="sparkles" size={32} color="#7C3AED" />
            </View>
            <Text style={styles.logoText}>SOS</Text>
            <Text style={styles.subtitle}>Style on Spot</Text>
          </View>

          {/* Tagline */}
          <Text style={styles.tagline}>
            "Where Elegance{'\n'}Meets Everyday Dressing."
          </Text>
        </View>

        {/* Bottom Card */}
        <View style={styles.bottomCard}>
          <Text style={styles.cardTitle}>Welcome to Style on Spot</Text>
          <Text style={styles.cardSubtitle}>
            Discover your perfect style with AI-powered fashion recommendations
          </Text>

          <TouchableOpacity
            style={styles.getStartedButton}
            onPress={() => navigation.navigate('SignIn')}
            activeOpacity={0.8}
          >
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginBold}>Login</Text>
            </Text>
          </TouchableOpacity>
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
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circle1: {
    width: 350,
    height: 350,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 250,
    height: 250,
    top: 50,
    left: -80,
  },
  circle3: {
    width: 180,
    height: 180,
    top: 200,
    right: 20,
  },
  circle4: {
    width: 120,
    height: 120,
    bottom: 300,
    left: 50,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 32,
    marginTop: 20,
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 30,
    paddingTop: 35,
    paddingBottom: 50,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  getStartedButton: {
    backgroundColor: '#1F2937',
    borderRadius: 14,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: '#6B7280',
  },
  loginBold: {
    fontWeight: '600',
    color: '#1F2937',
  },
});
