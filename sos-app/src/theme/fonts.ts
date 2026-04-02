import { useEffect, useState } from 'react';
import * as Font from 'expo-font';

/**
 * Albert Sans Font Family Configuration
 * 
 * Global theme configuration using Albert Sans custom fonts.
 * This ensures consistent typography across iOS and Android.
 */

// Albert Sans font family names (matching the .ttf file names)
export const fontNames: Record<FontWeight, string> = {
  light: 'AlbertSans-Light',
  regular: 'AlbertSans-Regular',
  medium: 'AlbertSans-Medium',
  bold: 'AlbertSans-Bold',
  heavy: 'AlbertSans-Black',
};

export type FontWeight = 'light' | 'regular' | 'medium' | 'bold' | 'heavy';

export const fontWeights: Record<FontWeight, string> = {
  light: '300',
  regular: '400',
  medium: '500',
  bold: '700',
  heavy: '800',
};

/**
 * useSOSFonts - Hook to load the Albert Sans fonts.
 * This hook is used in App.tsx to ensure fonts are ready before rendering.
 */
export const useSOSFonts = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          'AlbertSans-Regular': require('../../assets/fonts/Albert Sans/AlbertSans-Regular.ttf'),
          'AlbertSans-Light': require('../../assets/fonts/Albert Sans/AlbertSans-Light.ttf'),
          'AlbertSans-Medium': require('../../assets/fonts/Albert Sans/AlbertSans-Medium.ttf'),
          'AlbertSans-Bold': require('../../assets/fonts/Albert Sans/AlbertSans-Bold.ttf'),
          'AlbertSans-Black': require('../../assets/fonts/Albert Sans/AlbertSans-Black.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        setFontError(error as Error);
        // Still set loaded to true to prevent app from hanging
        setFontsLoaded(true);
      }
    }

    loadFonts();
  }, []);

  return { fontsLoaded, fontError };
};

// Get font family name based on weight
export const getFontFamily = (weight: FontWeight = 'regular'): string => {
  return fontNames[weight];
};

// Typography scale using the global fontNames
export const appTypography = {
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

export type TypographyVariant = keyof typeof appTypography;
