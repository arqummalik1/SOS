import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { GlassView } from './GlassView';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: 'ultraThin' | 'thin' | 'regular' | 'thick' | 'chromatic';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 'regular',
}) => {
  return (
    <GlassView intensity={intensity} borderRadius={24} style={styles.card}>
      <View style={[styles.content, style]}>
        {children}
      </View>
    </GlassView>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  content: {
    padding: 16,
  },
});
