/**
 * Family SACCO — design tokens.
 * A calm purple-and-white theme. Light mode only (by design) so the brand
 * colour stays consistent across Android, iOS and web.
 */
import '@/global.css';

import { Platform, TextStyle } from 'react-native';

/** Core purple ramp + neutrals. */
export const palette = {
  // Brand purple
  purple50: '#F5F3FF',
  purple100: '#EDE9FE',
  purple200: '#DDD6FE',
  purple300: '#C4B5FD',
  purple400: '#A78BFA',
  purple500: '#8B5CF6',
  purple600: '#7C3AED',
  purple700: '#6D28D9',
  purple800: '#5B21B6',
  purple900: '#4C1D95',

  white: '#FFFFFF',
  // Neutrals with a faint purple tint so greys feel part of the brand
  ink: '#1C1726',
  slate700: '#3F3A4D',
  slate500: '#6B6579',
  slate400: '#908BA0',
  slate300: '#C9C5D4',
  slate200: '#E7E4EF',
  slate100: '#F3F1F8',
  slate50: '#FAF9FC',

  success: '#16A34A',
  successBg: '#DCFCE7',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  danger: '#DC2626',
  dangerBg: '#FEE2E2',
  info: '#7C3AED',
  infoBg: '#EDE9FE',
} as const;

export const theme = {
  colors: {
    primary: palette.purple600,
    primaryDark: palette.purple800,
    primaryContent: palette.white,
    primarySoft: palette.purple100,
    primarySurface: palette.purple50,

    background: palette.white,
    surface: palette.white,
    surfaceMuted: palette.slate50,
    surfaceSunken: palette.slate100,

    border: palette.slate200,
    borderStrong: palette.slate300,

    text: palette.ink,
    textSecondary: palette.slate500,
    textMuted: palette.slate400,
    textOnPrimary: palette.white,

    success: palette.success,
    successBg: palette.successBg,
    warning: palette.warning,
    warningBg: palette.warningBg,
    danger: palette.danger,
    dangerBg: palette.dangerBg,
    info: palette.info,
    infoBg: palette.infoBg,

    // chart colours used for per-member contribution slices
    chart: [
      palette.purple600,
      palette.purple400,
      palette.purple800,
      '#C026D3',
      '#9333EA',
      '#A855F7',
      '#6366F1',
      '#D946EF',
      '#8B5CF6',
      '#7E22CE',
    ],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 22,
    pill: 999,
  },
  // soft, low-contrast card shadow
  shadow: {
    card: Platform.select({
      web: { boxShadow: '0 6px 20px rgba(76, 29, 149, 0.08)' } as any,
      default: {
        shadowColor: '#4C1D95',
        shadowOpacity: 0.1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 6 },
        elevation: 3,
      },
    }),
    button: Platform.select({
      web: { boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)' } as any,
      default: {
        shadowColor: palette.purple600,
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      },
    }),
  },
} as const;

type FontWeight = TextStyle['fontWeight'];

/** Typographic scale. */
export const typography: Record<
  string,
  { fontSize: number; lineHeight: number; fontWeight: FontWeight; letterSpacing?: number }
> = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '800', letterSpacing: -0.5 },
  h1: { fontSize: 26, lineHeight: 32, fontWeight: '800', letterSpacing: -0.4 },
  h2: { fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: -0.2 },
  h3: { fontSize: 17, lineHeight: 23, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600', letterSpacing: 0.1 },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
  tiny: { fontSize: 11, lineHeight: 15, fontWeight: '600', letterSpacing: 0.3 },
  mono: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
};

export const MaxContentWidth = 560;

export type Theme = typeof theme;
