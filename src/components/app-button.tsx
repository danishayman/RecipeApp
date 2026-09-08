import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Swaps the label for a spinner and blocks presses. */
  busy?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
  /** Use the compact tracked treatment for utility actions. */
  labelCase?: 'normal' | 'caps';
}

/**
 * The single button used across the app.
 *
 * Keeping the three variants here means hit target, radius and disabled
 * treatment stay consistent everywhere rather than being restyled per screen.
 */
export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  busy = false,
  style,
  accessibilityHint,
  labelCase = 'normal',
}: AppButtonProps) {
  const theme = useTheme();
  const isInert = disabled || busy;

  const background = {
    primary: theme.accent,
    secondary: theme.backgroundElement,
    danger: theme.danger,
  }[variant];

  const foreground = {
    primary: theme.onAccent,
    secondary: theme.text,
    danger: theme.onDanger,
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isInert}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isInert, busy }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderColor: variant === 'secondary' ? theme.border : background,
          opacity: isInert ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}>
      {busy ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <ThemedText
          type={labelCase === 'caps' ? 'label' : 'smallBold'}
          style={[styles.label, { color: foreground }]}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    // 52pt keeps the control well above the recommended minimum touch target.
    minHeight: 52,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    // Pills, matching the rounded controls the design uses throughout.
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
