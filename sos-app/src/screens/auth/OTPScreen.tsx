import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingMosaic } from '../../components/layout/OnboardingMosaic';
import { OTPInput } from '../../components/inputs/OTPInput';
import { useOTPViewModel } from '../../viewmodels/useOTPViewModel';
import { typography } from '../../theme/typography';
import { notify } from '../../utils/notify';
import { authService } from '../../services/authService';
import { resolveNextOnboardingRoute } from '../../navigation/onboardingFlow';

const { height } = Dimensions.get('window');

interface OTPScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const OTPScreen: React.FC<OTPScreenProps> = ({ navigation }) => {
  const {
    otp,
    isComplete,
    isVerifying,
    isResending,
    error,
    resendTimer,
    handleChange,
    handleVerify,
    handleResend,
    clearError,
  } = useOTPViewModel();
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (!error) {
      return;
    }
    notify({ type: 'error', message: error });
    clearError();
  }, [error, clearError]);

  const onVerify = async () => {
    if (!agreed) {
      notify({
        type: 'error',
        message: 'Please agree to the Terms & Conditions and Privacy Policy',
        title: 'Terms & Conditions',
      });
      return;
    }

    const message = await handleVerify();
    if (!message) {
      return;
    }
    notify({ type: 'success', message });

    try {
      const status = await authService.getOnboardingStatus();
      const nextRoute = resolveNextOnboardingRoute(status);
      if (nextRoute === 'Main') {
        // RootNavigator reacts to auth state and moves to Main when onboarding is complete.
        return;
      }
      if (nextRoute === 'StylePreferences' || nextRoute === 'BodyMeasurements') {
        navigation.navigate(nextRoute, { profileData: {} });
        return;
      }
      if (nextRoute === 'ProfileSetup' || nextRoute === 'FullBodyPhoto') {
        navigation.navigate(nextRoute, { profileData: {} });
        return;
      }
      navigation.navigate(nextRoute);
    } catch (error) {
      console.warn('[SOS_AUTH] Could not resolve onboarding route from API status, using fallback', error);
      navigation.navigate('ProfileSetupHub');
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
            <Text style={styles.title}>OTP</Text>
            <Text style={styles.subtitle}>Please enter the 6-digit code</Text>

            <View style={styles.inputContainer}>
              <OTPInput
                value={otp}
                onChange={handleChange}
              />
            </View>

            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAgreed(!agreed)}
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

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!isComplete || isVerifying) && styles.buttonDisabled
                ]}
                onPress={onVerify}
                disabled={!isComplete || isVerifying}
                activeOpacity={0.8}
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Verify</Text>
                )}
              </TouchableOpacity>
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.resendContainer}>
              {resendTimer > 0 ? (
                <Text style={styles.resendText}>
                  Resend code in {resendTimer}s
                </Text>
              ) : (
                <TouchableOpacity
                  disabled={isResending}
                  onPress={async () => {
                    const message = await handleResend();
                    if (message) {
                      notify({ type: 'success', message });
                    }
                  }}
                >
                  {isResending ? (
                    <View style={styles.resendLoaderRow}>
                      <ActivityIndicator size="small" color="#000000" />
                      <Text style={styles.resendLoadingText}>Sending...</Text>
                    </View>
                  ) : (
                    <Text style={styles.resendLink}>Resend code</Text>
                  )}
                </TouchableOpacity>
              )}
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
    marginBottom: 40,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 36,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: 24,
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
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#0A0A0A',
    width: '100%',
    height: 58,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#999999',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontFamily: typography.headline.fontFamily,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontFamily: typography.footnote.fontFamily,
    fontSize: 13,
    color: '#999999',
  },
  resendLink: {
    fontFamily: typography.footnote.fontFamily,
    fontSize: 13,
    color: '#000000',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendLoaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resendLoadingText: {
    fontFamily: typography.footnote.fontFamily,
    fontSize: 13,
    color: '#000000',
    fontWeight: '600',
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
