import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PhoneInput } from '../../components/inputs/PhoneInput';
import { useAuthViewModel } from '../../viewmodels/useAuthViewModel';
import { typography } from '../../theme/typography';
import { OnboardingMosaic } from '../../components/layout/OnboardingMosaic';
import { notify } from '../../utils/notify';

const { height } = Dimensions.get('window');

interface SignInScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const {
    phone,
    countryCode,
    isValid,
    isLoading,
    error,
    setPhone,
    setCountryCode,
    handleLogin,
    clearError,
  } = useAuthViewModel();
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!error) {
      return;
    }
    notify({ type: 'error', message: error });
    clearError();
  }, [error, clearError]);

  const onLogin = async () => {
    if (!agreed) {
      notify({
        type: 'error',
        message: 'Please agree to the Terms & Conditions and Privacy Policy',
        title: 'Terms & Conditions',
      });
      return;
    }

    const message = await handleLogin();
    if (message) {
      notify({ type: 'success', message });
      navigation.navigate('OTP');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background Layer */}
      <View style={styles.backgroundLayer} pointerEvents="none">
        <OnboardingMosaic />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Transparent Spacer to allow background to show through */}
          <View style={styles.spacer} />

          {/* Bottom Content Card */}
          <View style={styles.bottomCard}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>Enter Your Phone Number</Text>

            <View style={styles.inputContainer}>
              <PhoneInput
                value={phone}
                onChangeText={(value) => {
                  setPhone(value);
                  if (error) {
                    clearError();
                  }
                }}
                countryCode={countryCode}
                onCountryCodeChange={setCountryCode}
              />
            </View>

            <TouchableOpacity 
              style={[
                styles.primaryButton,
                (!isValid || isLoading) && styles.buttonDisabled,
              ]}
              onPress={onLogin}
              disabled={!isValid || isLoading}
              activeOpacity={0.9}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Login</Text>
              )}
            </TouchableOpacity>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAgreed(!agreed)}
                activeOpacity={0.8}
              >
                {agreed && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.termsLink}>Terms & Conditions</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7', // Match mosaic background
  },
  keyboardAvoid: {
    flex: 1,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContent: {
    flexGrow: 1,
  },
  spacer: {
    height: height * 0.52, // Allow background mosaic to show
  },
  bottomCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingHorizontal: 32,
    paddingTop: height * 0.04,
    paddingBottom: height * 0.05,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  title: {
    fontFamily: typography.title1.fontFamily,
    fontSize: 28,
    lineHeight: 34,
    color: '#000000',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: typography.body.fontFamily,
    fontSize: 15,
    color: '#666666',
    marginBottom: 36,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: '#0A0A0A',
    width: '100%',
    height: 58,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#777777',
  },
  buttonText: {
    fontFamily: typography.headline.fontFamily,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#000000',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkmark: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    fontFamily: typography.footnote.fontFamily,
    fontSize: 12,
    color: '#000000',
    lineHeight: 18,
  },
  termsLink: {
    color: '#000000',
    fontFamily: typography.footnote.fontFamily,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  errorText: {
    width: '100%',
    marginTop: -10,
    marginBottom: 14,
    fontFamily: typography.caption1.fontFamily,
    fontSize: 12,
    color: '#D74444',
    textAlign: 'left',
  },
});
