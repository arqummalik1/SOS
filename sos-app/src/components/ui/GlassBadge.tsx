import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ViewStyle,
} from 'react-native';
import { GlassView } from './GlassView';
import { typography } from '../../theme/typography';

interface GlassBadgeProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'accent';
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  style,
  variant = 'default',
}) => {
  return (
    <GlassView
      intensity={variant === 'accent' ? 'regular' : 'thin'}
      borderRadius={100}
      style={styles.badge}
    >
      <Text style={styles.text}>{children}</Text>
    </GlassView>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.caption1.fontSize,
    fontWeight: typography.caption1.fontWeight,
    color: '#FFFFFF',
  },
});
