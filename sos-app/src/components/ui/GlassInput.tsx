import React from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
  TextStyle,
  TextInputProps,
  Text,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius } from '../../theme/spacing';

interface GlassInputProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  variant?: 'light' | 'dark';
  error?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  containerStyle,
  inputStyle,
  variant = 'dark',
  error,
  ...textInputProps
}) => {
  const isDark = variant === 'dark';

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            isDark ? styles.labelDark : styles.labelLight,
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          isDark ? styles.inputDark : styles.inputLight,
          error && styles.inputError,
        ]}
      >
        <TextInput
          style={[
            styles.input,
            isDark ? styles.textDark : styles.textLight,
            inputStyle,
          ]}
          placeholderTextColor={
            isDark
              ? 'rgba(255,255,255,0.35)'
              : 'rgba(0,0,0,0.35)'
          }
          {...textInputProps}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...typography.subheadline,
    marginBottom: 8,
  },
  labelDark: {
    color: colors.text.secondary,
  },
  labelLight: {
    color: colors.text.onLightSecondary,
  },
  inputContainer: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: 16,
    height: 56,
    justifyContent: 'center',
  },
  inputDark: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  inputLight: {
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(120,120,128,0.2)',
  },
  inputError: {
    borderColor: colors.ui.error,
    borderWidth: 1,
  },
  input: {
    ...typography.body,
    padding: 0,
  },
  textDark: {
    color: colors.text.primary,
  },
  textLight: {
    color: colors.text.onLight,
  },
  errorText: {
    ...typography.caption1,
    color: colors.ui.error,
    marginTop: 4,
  },
});
