/**
 * Design tokens for YumBook.
 *
 * Every colour is declared for both light and dark schemes so that
 * `useTheme()` can return a single palette object for the active scheme.
 * Components should never hardcode a colour literal - always read it from here.
 */

import '@/global.css';

import { Platform } from 'react-native';

/**
 * The YumBook palette: a warm paper ground, near-black ink, and the
 * ember accent the app already used.
 *
 * Light is taken from the design directly. Dark is derived - the direction
 * specifies no dark scheme - and deliberately stays warm rather than reusing a
 * neutral charcoal, so the paper-and-ink character survives the switch.
 */
export const Colors = {
  light: {
    /** Ink. Also the fill for the highest-emphasis buttons. */
    text: '#1F1B16',
    textSecondary: '#766E63',
    /** Paper. */
    background: '#FAF7F2',
    /** Raised surfaces that sit on the paper: fields, sheets. */
    backgroundElement: '#FFFFFF',
    /** Recessed fills: image placeholders, avatars, pressed rows. */
    backgroundSelected: '#EFE7DA',
    /** Hairline rules between rows, and field borders. */
    border: '#E6DFD4',
    accent: '#E8590C',
    /**
     * Ink on the ember rather than white: white only reaches 3.6:1 on this
     * accent, which fails for button labels. This measures 4.98:1, and it
     * matches what the dark scheme already does.
     */
    onAccent: '#2B1000',
    /**
     * The accent darkened for use *as text*. The accent itself only reaches
     * about 3.3:1 on paper, which is short of the 4.5:1 that small text needs;
     * this passes. Use `accent` for fills, `accentStrong` for words.
     */
    accentStrong: '#B8460A',
    danger: '#B3261E',
    onDanger: '#FFFFFF',
  },
  dark: {
    text: '#F2EDE4',
    textSecondary: '#A99E8E',
    background: '#14110D',
    backgroundElement: '#1E1A15',
    backgroundSelected: '#2A241C',
    border: '#332C23',
    accent: '#FF8A3D',
    onAccent: '#241004',
    /** Lifted rather than darkened - on ink, text needs to go brighter. */
    accentStrong: '#FFA76B',
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
