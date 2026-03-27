import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { intensityMap, GlassIntensity } from '../../theme/glass';

interface GlassViewProps {
  intensity?: GlassIntensity;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  borderRadius?: number;
  hasSpecularHighlight?: boolean;
  hasBorder?: boolean;
  tint?: 'dark' | 'light';
}

export const GlassView: React.FC<GlassViewProps> = ({
  intensity = 'regular',
  children,
  style,
  borderRadius = 20,
  hasSpecularHighlight = true,
  hasBorder = true,
  tint = 'dark',
}) => {
  const config = intensityMap[intensity];

  return (
    <View style={[{ borderRadius, overflow: 'hidden' }, style]}>
      <BlurView intensity={config.blur} tint={tint} style={StyleSheet.absoluteFill} />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: config.bg,
            borderRadius,
          },
        ]}
      />
      {hasSpecularHighlight && (
        <LinearGradient
          colors={['rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
          style={[StyleSheet.absoluteFill, { borderRadius, height: '40%' }]}
        />
      )}
      {hasBorder && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius,
              borderWidth: 0.5,
              borderColor: 'rgba(255,255,255,0.30)',
            },
          ]}
        />
      )}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
