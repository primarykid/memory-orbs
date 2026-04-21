export const colors = {
  space: {
    background: '#02040F',
    nebulaPurple: '#2D1B69',
    nebulaIndigo: '#1B2A6B',
    nebulaBlue: '#0A1628',
    star: '#FFFFFF',
  },
} as const;

export type Colors = typeof colors;
export const SPACE = {
  DEEP_SPACE: '#02040F',
  NEBULA_PURPLE: '#2D1B69',
  NEBULA_INDIGO: '#1B2A6B',
  DEEP_BLUE: '#0A1628',
  GLASS_OVERLAY: '#0F1B3D',
  STAR_WHITE: '#FFFFFF',
  STAR_WARM: '#FFF4E0',
  ACCENT_INDIGO: '#5B6EF5',
} as const;
