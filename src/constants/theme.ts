/**
 * Палітра мобільного додатка — ідентична токенам сайту
 * `giraffe-site/src/styles/tokens.css` (макет «Табло маршруту»).
 */
export const COLORS = {
  green: '#1E5B3F',
  greenDeep: '#123B28',
  clay: '#C4622D',
  clayDeep: '#9C4A20',
  ochre: '#E8A33D',
  paper: '#FBF7EE',
  paper2: '#F6F1E3',
  ink: '#22302A',
  line: '#E3DCC9',
  white: '#FFFFFF',
  muted: '#5A6B60',
  mutedLight: '#CFD8CF',
  danger: '#B03A2E',
  success: '#1E5B3F',
} as const;

/** сумісність зі старими іменами, що використовувалися в заготовці */
export const C = COLORS;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const SHADOWS = {
  card: {
    shadowColor: COLORS.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  // Фірмовий «жорсткий» штрих сайту: 3px 3px 0 ink
  stamp: {
    shadowColor: COLORS.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
} as const;
