import React, { createContext, useContext, useMemo } from 'react';
import { TextStyle, ViewStyle } from 'react-native';
import { appTypography, TypographyVariant } from './fonts';

// Typography types from fonts.ts
export type { TypographyVariant } from './fonts';

// Figma-matched Color Palette
export const sosColors = {
  // Primary Colors
  primary: {
    main: '#7C3AED',
    light: '#A78BFA',
    dark: '#5B21B6',
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  
  // Neutral Colors (Gray Scale)
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712',
  },
  
  // Semantic Colors
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    dark: '#111827',
  },
  
  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
    disabled: '#D1D5DB',
  },
  
  // Border Colors
  border: {
    light: '#E5E7EB',
    medium: '#D1D5DB',
    dark: '#9CA3AF',
  },
  
  // Overlay Colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.04)',
    medium: 'rgba(0, 0, 0, 0.08)',
    heavy: 'rgba(0, 0, 0, 0.24)',
    modal: 'rgba(0, 0, 0, 0.5)',
  },
} as const;

// Spacing Scale
export const sosSpacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

// Border Radius Scale
export const sosBorderRadius = {
  none: 0,
  sm: 4,
  base: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

// Shadow/Elevation Styles
export const sosShadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 16,
  },
} as const;

// Complete Theme Object
export interface SOSTheme {
  colors: typeof sosColors;
  typography: typeof appTypography;
  spacing: typeof sosSpacing;
  borderRadius: typeof sosBorderRadius;
  shadows: typeof sosShadows;
}

const defaultTheme: SOSTheme = {
  colors: sosColors,
  typography: appTypography,
  spacing: sosSpacing,
  borderRadius: sosBorderRadius,
  shadows: sosShadows,
};

// Theme Context
const ThemeContext = createContext<SOSTheme>(defaultTheme);

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const theme = useMemo(() => defaultTheme, []);
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Helper function to get text style by variant
export const getTextStyle = (variant: TypographyVariant): TextStyle => {
  return appTypography[variant];
};

// Helper function to combine multiple spacing values
export const combineSpacing = (...values: Array<keyof typeof sosSpacing | number>): number => {
  return values.reduce((acc, val) => {
    if (typeof val === 'number') return acc + val;
    return acc + sosSpacing[val];
  }, 0);
};
