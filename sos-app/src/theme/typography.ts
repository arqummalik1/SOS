import { fontNames } from './fonts';

export const typography = {
  largeTitle: {
    fontFamily: fontNames.bold,
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.37,
  },
  title1: {
    fontFamily: fontNames.bold,
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
  },
  title2: {
    fontFamily: fontNames.bold,
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
  },
  title3: {
    fontFamily: fontNames.medium,
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
  },
  headline: {
    fontFamily: fontNames.medium,
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
  },
  body: {
    fontFamily: fontNames.regular,
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
  },
  callout: {
    fontFamily: fontNames.regular,
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
  },
  subheadline: {
    fontFamily: fontNames.regular,
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
  },
  footnote: {
    fontFamily: fontNames.regular,
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
  },
  caption1: {
    fontFamily: fontNames.regular,
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  caption2: {
    fontFamily: fontNames.regular,
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0.07,
  },
  extraSmall: {
    fontFamily: fontNames.regular,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '400' as const,
  },
  small: {
    fontFamily: fontNames.regular,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  medium: {
    fontFamily: fontNames.medium,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  large: {
    fontFamily: fontNames.bold,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700' as const,
  },
};

export type TypographyStyle = keyof typeof typography;
