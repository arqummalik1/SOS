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
import { PhoneInput } from '../../components/inputs/PhoneInput';
import { useAuthViewModel } from '../../viewmodels/useAuthViewModel';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface SignInScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({ navigation }) => {
  const { phone, countryCode, isValid, isLoading, setPhone, setCountryCode, handleLogin } = useAuthViewModel();
  const [agreed, setAgreed] = useState(false);

  const onLogin = async () => {
    if (!agreed) {
      Alert.alert('Terms & Conditions', 'Please agree to the Terms & Conditions and Privacy Policy');
      return;
    }

    const success = await handleLogin();
    if (success) {
      navigation.navigate('OTP');
    }
  };

  return (
    <View style={styles.container}>
      <MosaicBackground />
      <GlassBottomSheet variant="light" height={400}>
        <View style={styles.content}>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>Enter Your Phone Number</Text>

          <View style={styles.inputContainer}>
            <PhoneInput
              value={phone}
              onChangeText={setPhone}
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
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
              title="Login"
              onPress={onLogin}
              variant="solid"
              disabled={!isValid || isLoading}
            />
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
    marginBottom: spacing.xxl,
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
  },
});
