export const colors = {
  // Backgrounds
  bg: {
    deepPurple: '#0A0015',
    gradient: ['#1A0533', '#0D1B4B', '#000D2E'] as const,
  },
  // Light mode backgrounds (for auth screens)
  bgLight: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
  },
  // Glass layers
  glass: {
    ultraThin: 'rgba(255,255,255,0.05)',
    thin: 'rgba(255,255,255,0.10)',
    regular: 'rgba(255,255,255,0.15)',
    thick: 'rgba(255,255,255,0.22)',
    border: 'rgba(255,255,255,0.28)',
    specular: 'rgba(255,255,255,0.18)',
    inset: 'rgba(0,0,0,0.25)',
    lightSheet: 'rgba(255,255,255,0.92)',
  },
  // Accents
  accent: {
    purple: '#BF5AF2',
    purpleSoft: 'rgba(191,90,242,0.6)',
    blue: '#0A84FF',
    coral: '#FF375F',
    green: '#32D74B',
    gold: '#FFD60A',
  },
  // Text
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255,255,255,0.72)',
    tertiary: 'rgba(255,255,255,0.45)',
    inverse: '#000000',
    onLight: '#1C1C1E',
    onLightSecondary: '#666666',
    onLightTertiary: '#999999',
  },
  // Semantic
  solid: {
    black: '#000000',
    white: '#FFFFFF',
  },
  // UI
  ui: {
    error: '#FF375F',
    success: '#32D74B',
    warning: '#FFD60A',
  },
};
