// Single source of truth for all colours
export const SPACE = {
  DEEP_SPACE:     '#02040F',
  NEBULA_PURPLE:  '#2D1B69',
  NEBULA_INDIGO:  '#1B2A6B',
  DEEP_BLUE:      '#0A1628',
  GLASS_OVERLAY:  '#0F1B3D',
  STAR_WHITE:     '#FFFFFF',
  STAR_WARM:      '#FFF4E0',
  ACCENT_INDIGO:  '#5B6EF5',
} as const;

// Legacy alias used by SpaceBackground + Starfield — maps to SPACE values
export const colors = {
  space: {
    background:   SPACE.DEEP_SPACE,
    nebulaPurple: SPACE.NEBULA_PURPLE,
    nebulaIndigo: SPACE.NEBULA_INDIGO,
    nebulaBlue:   SPACE.DEEP_BLUE,
    star:         SPACE.STAR_WHITE,
  },
} as const;

export type Colors = typeof colors;
