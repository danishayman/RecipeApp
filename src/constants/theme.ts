/**
 * Design tokens for the Recipe app.
 *
 * Every colour is declared for both light and dark schemes so that
 * `useTheme()` can return a single palette object for the active scheme.
 * Components should never hardcode a colour literal - always read it from here.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#5A6570',
    background: '#FFFFFF',
    backgroundElement: '#F4F6F8',
    backgroundSelected: '#E4E8EC',
    border: '#E1E5EA',
    accent: '#E8590C',
    onAccent: '#FFFFFF',
    danger: '#D93025',
    onDanger: '#FFFFFF',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#0E1113',
    backgroundElement: '#1A1D1F',
    backgroundSelected: '#25292C',
    border: '#2A2F33',
    accent: '#FF8A3D',
    onAccent: '#241004',
    danger: '#FF6B6B',
    onDanger: '#2B0A0A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * A resolved palette for one appearance. Widened to `string` deliberately:
 * `as const` above gives each entry a literal type, which would otherwise
 * make the light and dark palettes mutually unassignable.
 */
export type ThemePalette = Readonly<Record<ThemeColor, string>>;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

/** 4pt spacing scale. Use these instead of raw pixel values. */
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

/** Corner radii scale. */
export const Radii = {
  small: 8,
  medium: 12,
  large: 20,
  pill: 999,
} as const;

/** Caps line length on tablets and landscape phones so text stays readable. */
export const MaxContentWidth = 900;

/** Wider cap for the card grid, which tolerates more width than prose does. */
export const MaxGridWidth = 1200;
