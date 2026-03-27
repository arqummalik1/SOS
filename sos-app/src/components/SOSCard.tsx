import React from 'react';
import {
  View,
  ViewProps,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme';

interface SOSCardProps extends ViewProps {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const SOSCard: React.FC<SOSCardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  style,
  ...props
}) => {
  const theme = useTheme();

  const getPadding = () => {
    switch (padding) {
      case 'none': return 0;
      case 'small': return theme.spacing[3];
      case 'medium': return theme.spacing[4];
      case 'large': return theme.spacing[6];
      default: return theme.spacing[4];
    }
  };

  const getCardStyles = () => {
    const baseStyles = {
      backgroundColor: theme.colors.background.primary,
      borderRadius: theme.borderRadius.xl,
      padding: getPadding(),
    };

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyles,
          borderWidth: 1,
          borderColor: theme.colors.border.light,
        };
      case 'elevated':
        return {
          ...baseStyles,
          ...theme.shadows.md,
        };
      default:
        return baseStyles;
    }
  };

  return (
    <View style={[styles.card, getCardStyles(), style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
});
