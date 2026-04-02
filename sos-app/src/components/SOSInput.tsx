import React from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { SOSText } from './SOSText';
import { typography } from '../theme/typography';

interface SOSInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: any;
}

export const SOSInput: React.FC<SOSInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  ...textInputProps
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <SOSText variant="labelMedium" style={styles.label}>
          {label}
        </SOSText>
      )}
      <View style={[
        styles.inputContainer,
        error && styles.inputContainerError,
        { backgroundColor: theme.colors.gray[100] }
      ]}>
        {leftIcon && (
          <Ionicons 
            name={leftIcon as any} 
            size={20} 
            color={theme.colors.gray[500]} 
            style={styles.leftIcon} 
          />
        )}
        <TextInput
          style={[
            styles.input,
            { 
              color: theme.colors.gray[900],
              fontFamily: theme.typography.bodyMedium.fontFamily,
            },
            style,
          ]}
          placeholderTextColor={theme.colors.gray[400]}
          {...textInputProps}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress}>
            <Ionicons 
              name={rightIcon as any} 
              size={20} 
              color={theme.colors.gray[500]} 
              style={styles.rightIcon} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <SOSText variant="bodySmall" color={theme.colors.semantic.error} style={styles.error}>
          {error}
        </SOSText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 16,
  },
  inputContainerError: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: typography.body.fontSize,
  },
  rightIcon: {
    marginLeft: 12,
  },
  error: {
    marginTop: 4,
  },
});
