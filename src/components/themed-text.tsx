import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * The type scale, in three families that each have one job:
 *
 * - **serif** carries the headings, and is what gives the app its editorial,
 *   recipe-box character;
 * - **mono**, always uppercase and tracked out, carries metadata and field
 *   labels — anything that reads as annotation rather than prose;
 * - **sans** carries body copy.
 *
 * The design calls for Newsreader, IBM Plex Mono and Spline Sans. These map to
 * the platform's own serif, monospace and sans faces via `Fonts`, so the app
 * needs no font files; swapping in the real families later is a change to
 * `Fonts` alone.
 */
export type ThemedTextType =
  | 'default'
  | 'small'
  | 'smallBold'
  | 'subtitle'
  | 'heading'
  | 'headingSmall'
  | 'label'
  | 'meta';

export type ThemedTextProps = TextProps & {
  type?: ThemedTextType;
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return <Text style={[{ color: theme[themeColor ?? 'text'] }, styles[type], style]} {...rest} />;
}

const styles = StyleSheet.create({
  // Sans — body copy.
  default: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  small: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
  },
  smallBold: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },

  // Serif — headings.
  subtitle: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '400',
  },
  heading: {
    fontFamily: Fonts.serif,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '500',
  },
  headingSmall: {
    fontFamily: Fonts.serif,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '500',
  },

  // Mono — metadata and field labels. Uppercase and tracking are part of the
  // variant so call sites never have to remember them.
  label: {
    fontFamily: Fonts.mono,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  meta: {
    fontFamily: Fonts.mono,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
