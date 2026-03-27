import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MosaicBackground } from '../../components/layout/MosaicBackground';
import { GlassBottomSheet } from '../../components/ui/GlassBottomSheet';
import { GlassButton } from '../../components/ui/GlassButton';
import { OTPInput } from '../../components/inputs/OTPInput';
import { useOTPViewModel } from '../../viewmodels/useOTPViewModel';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface OTPScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const OTPScreen: React.FC<OTPScreenProps> = ({ navigation }) => {
  const {
    otp,
    isComplete,
    isLoading,
    error,
    resendTimer,
    handleChange,
    handleVerify,
    handleResend,
  } = useOTPViewModel();
  const [agreed, setAgreed] = useState(false);

  const onVerify = async () => {
    if (!agreed) {
      Alert.alert('Terms & Conditions', 'Please agree to the Terms & Conditions and Privacy Policy');
      return;
    }

    const success = await handleVerify();
    if (success) {
      navigation.navigate('ProfilePicture');
    }
  };

  return (
    <View style={styles.container}>
      <MosaicBackground />
      <GlassBottomSheet variant="light" height={380}>
        <View style={styles.content}>
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
              <View style={[styles.checkboxInner, agreed && styles.checkboxChecked]} />
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms & Conditions</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <GlassButton
              title="Verify"
              onPress={onVerify}
              variant="solid"
              disabled={!isComplete || isLoading}
            />
          </View>

          <View style={styles.resendContainer}>
            {resendTimer > 0 ? (
              <Text style={styles.resendText}>
                Resend OTP in {resendTimer}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>
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
    paddingTop: spacing.md,
  },
  title: {
    fontSize: typography.title1.fontSize,
    fontWeight: typography.title1.fontWeight,
    color: '#000000',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.subheadline.fontSize,
    fontWeight: typography.subheadline.fontWeight,
    color: '#666666',
    marginBottom: spacing.xxl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#000000',
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
  },
  checkboxChecked: {
    backgroundColor: '#000000',
  },
  termsText: {
    flex: 1,
    fontSize: typography.footnote.fontSize,
    color: '#666666',
    lineHeight: 18,
  },
  termsLink: {
    color: '#000000',
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: typography.footnote.fontSize,
    color: '#999999',
  },
  resendLink: {
    fontSize: typography.footnote.fontSize,
    color: '#000000',
    fontWeight: '600',
  },
});
