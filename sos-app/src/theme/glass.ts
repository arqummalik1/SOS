export const glassPresets = {
  card: {
    blurIntensity: 30,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderColor: 'rgba(255,255,255,0.25)',
    borderWidth: 0.5,
    borderRadius: 24,
    boxShadow: '0px 8px 24px rgba(0,0,0,0.3)',
    elevation: 12,
  },
  pill: {
    blurIntensity: 40,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.35)',
    borderWidth: 0.5,
    borderRadius: 100,
  },
  bottomSheet: {
    blurIntensity: 80,
    backgroundColor: 'rgba(255,255,255,0.90)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  bottomSheetDark: {
    blurIntensity: 60,
    backgroundColor: 'rgba(15,0,30,0.85)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  input: {
    blurIntensity: 0,
    backgroundColor: 'rgba(120,120,128,0.12)',
    borderColor: 'rgba(120,120,128,0.2)',
    borderWidth: 1,
    borderRadius: 14,
  },
  inputDark: {
    blurIntensity: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 0.5,
    borderRadius: 14,
  },
};

export type GlassIntensity = 'ultraThin' | 'thin' | 'regular' | 'thick' | 'chromatic';

export const intensityMap = {
  ultraThin: { blur: 10, bg: 'rgba(255,255,255,0.05)' },
  thin: { blur: 20, bg: 'rgba(255,255,255,0.10)' },
  regular: { blur: 30, bg: 'rgba(255,255,255,0.15)' },
  thick: { blur: 50, bg: 'rgba(255,255,255,0.22)' },
  chromatic: { blur: 80, bg: 'rgba(255,255,255,0.30)' },
};
