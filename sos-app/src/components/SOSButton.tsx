import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../theme';
import { SOSText } from './SOSText';

interface SOSButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const SOSButton: React.FC<SOSButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const theme = useTheme();
  
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.gray[200];
    switch (variant) {
      case 'primary': return theme.colors.gray[800];
      case 'secondary': return theme.colors.gray[100];
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return theme.colors.gray[800];
    }
  };
  
  const getTextColor = () => {
    if (disabled) return theme.colors.gray[400];
    switch (variant) {
      case 'primary': return theme.colors.text.inverse;
      case 'secondary': return theme.colors.text.primary;
      case 'outline': return theme.colors.gray[800];
      case 'ghost': return theme.colors.gray[800];
      default: return theme.colors.text.inverse;
    }
  };
  
  const getHeight = () => {
    switch (size) {
      case 'small': return 40;
      case 'medium': return 48;
      case 'large': return 56;
      default: return 48;
    }
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          height: getHeight(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: variant === 'outline' ? theme.colors.gray[800] : 'transparent',
          borderRadius: theme.borderRadius.xl,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {leftIcon}
          <SOSText
            variant={size === 'small' ? 'labelMedium' : 'labelLarge'}
            color={getTextColor()}
            style={[styles.text, textStyle]}
          >
            {title}
          </SOSText>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  text: {
    fontWeight: '600',
  },
});
