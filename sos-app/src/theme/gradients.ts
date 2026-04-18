export const gradients = {
  /** SOS brand pink: linear fade from lighter left to deeper right. */
  sospink: {
    colors: ['#E2D3E6', '#A580A6'] as const,
    start: { x: 0, y: 0.5 } as const,
    end: { x: 1, y: 0.5 } as const,
  },
  pinkFade: {
    colors: ['#EEE3F3', '#DCC7E4'] as const,
    start: { x: 0, y: 0.5 } as const,
    end: { x: 1, y: 0.5 } as const,
  },
  /** Progress fill: lighter on the left, more saturated toward the right (Figma outfit score bars). */
  scoreProgress: {
    colors: ['#E8D4EF', '#9B72A8', '#7A4F8C'] as const,
    start: { x: 0, y: 0.5 } as const,
    end: { x: 1, y: 0.5 } as const,
  },
};

