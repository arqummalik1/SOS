import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../../theme/colors';
import { borderRadius } from '../../theme/spacing';

interface GlassBottomSheetProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'light' | 'dark';
  height?: number;
  showDragIndicator?: boolean;
}

const { height: screenHeight } = Dimensions.get('window');

export const GlassBottomSheet: React.FC<GlassBottomSheetProps> = ({
  children,
  style,
  variant = 'light',
  height = 380,
  showDragIndicator = true,
}) => {
  const isLight = variant === 'light';

  return (
    <View style={[styles.container, { height }, style]}>
      <BlurView
        intensity={isLight ? 80 : 60}
        tint={isLight ? 'light' : 'dark'}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          styles.background,
          isLight ? styles.lightBackground : styles.darkBackground,
        ]}
      />
      {showDragIndicator && (
        <View style={styles.dragIndicatorContainer}>
          <View style={styles.dragIndicator} />
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
    overflow: 'hidden',
    boxShadow: '0px -4px 20px rgba(0,0,0,0.15)',
    elevation: 20,
  },
  background: {
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
  },
  lightBackground: {
    backgroundColor: 'rgba(255,255,255,0.90)',
  },
  darkBackground: {
    backgroundColor: 'rgba(15,0,30,0.85)',
  },
  dragIndicatorContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  dragIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(120,120,128,0.3)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
});
