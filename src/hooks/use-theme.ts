import { useColorScheme } from 'react-native';

import { Colors, type ThemePalette } from '@/constants/theme';

/**
 * The colour palette for the device's current appearance setting.
 *
 * `useColorScheme` returns null when the system has not reported a preference
 * yet, which is treated as light rather than left undefined.
 *
 * @see https://docs.expo.dev/guides/color-schemes/
 */
export function useTheme(): ThemePalette {
  const scheme = useColorScheme();

  return Colors[scheme === 'dark' ? 'dark' : 'light'];
}
