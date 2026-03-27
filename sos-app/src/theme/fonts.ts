import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';

// KyivType SansSerif Font Family Configuration
// Note: These fonts need to be loaded from assets/fonts/ directory
export const fontNames = {
  light: 'KyivTypeSansSerif-Light',
  regular: 'KyivTypeSansSerif-Regular',
  medium: 'KyivTypeSansSerif-Medium',
  bold: 'KyivTypeSansSerif-Bold',
  heavy: 'KyivTypeSansSerif-Heavy',
} as const;

export type FontWeight = 'light' | 'regular' | 'medium' | 'bold' | 'heavy';

export const fontWeights: Record<FontWeight, string> = {
  light: '300',
  regular: '400',
  medium: '500',
  bold: '700',
  heavy: '800',
};

// Font loading hook
export const useSOSFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  const [loaded] = useFonts({
    'KyivTypeSansSerif-Light': require('../../assets/fonts/KyivTypeSansSerif-Light.otf'),
    'KyivTypeSansSerif-Regular': require('../../assets/fonts/KyivTypeSansSerif-Regular.otf'),
    'KyivTypeSansSerif-Medium': require('../../assets/fonts/KyivTypeSansSerif-Medium.otf'),
    'KyivTypeSansSerif-Bold': require('../../assets/fonts/KyivTypeSansSerif-Bold.otf'),
    'KyivTypeSansSerif-Heavy': require('../../assets/fonts/KyivTypeSansSerif-Heavy.otf'),
  });

  useEffect(() => {
    if (loaded) {
      setFontsLoaded(true);
    }
  }, [loaded]);

  return fontsLoaded;
};

// Get font family name based on weight
export const getFontFamily = (weight: FontWeight = 'regular'): string => {
  return fontNames[weight];
};

// Typography scale using KyivType SansSerif
export const kyivTypography = {
  // Display styles
  displayLarge: {
    fontFamily: fontNames.heavy,
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: -0.25,
  },
  displayMedium: {
    fontFamily: fontNames.heavy,
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: fontNames.bold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
  },
  
  // Headline styles
  headlineLarge: {
    fontFamily: fontNames.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: fontNames.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: fontNames.bold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
  },
  
  // Title styles
  titleLarge: {
    fontFamily: fontNames.medium,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: fontNames.medium,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: fontNames.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  
  // Body styles
  bodyLarge: {
    fontFamily: fontNames.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  bodyMedium: {
    fontFamily: fontNames.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: fontNames.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  
  // Label styles
  labelLarge: {
    fontFamily: fontNames.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: fontNames.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: fontNames.medium,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
} as const;

export type TypographyVariant = keyof typeof kyivTypography;
