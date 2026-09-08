import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface TextFieldProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  label: string;
  /** Validation message shown under the field. */
  error?: string | null;
  /** Grows the input and enables multiline entry. */
  multiline?: boolean;
  /** A single ruled line, used by the spare sign-in screen. */
  variant?: 'boxed' | 'ruled';
}

/** A labelled text input with inline validation feedback. */
export function TextField({
  label,
  error = null,
  multiline = false,
  variant = 'boxed',
  ...inputProps
}: TextFieldProps) {
  const theme = useTheme();
  const hasError = error !== null && error.length > 0;

  return (
    <View style={styles.container}>
      <ThemedText type="label" themeColor="textSecondary">
        {label}
      </ThemedText>

      <TextInput
        {...inputProps}
        multiline={multiline}
        accessibilityLabel={label}
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          multiline && styles.multiline,
          variant === 'ruled' && styles.ruled,
          {
            backgroundColor: variant === 'boxed' ? theme.backgroundElement : 'transparent',
            borderColor: hasError ? theme.danger : theme.border,
            color: theme.text,
          },
        ]}
      />

      {hasError ? (
        <ThemedText type="small" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  input: {
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.medium,
    borderWidth: StyleSheet.hairlineWidth,
    fontFamily: Fonts.sans,
    fontSize: 15,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  ruled: {
    minHeight: 46,
    paddingHorizontal: 0,
    borderWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 0,
  },
});
