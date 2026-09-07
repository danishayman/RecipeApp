import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface TextFieldProps extends Omit<TextInputProps, 'style' | 'placeholderTextColor'> {
  label: string;
  /** Validation message shown under the field. */
  error?: string | null;
  /** Grows the input and enables multiline entry. */
  multiline?: boolean;
}

/** A labelled text input with inline validation feedback. */
export function TextField({ label, error = null, multiline = false, ...inputProps }: TextFieldProps) {
  const theme = useTheme();
  const hasError = error !== null && error.length > 0;

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.label}>
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
          {
            backgroundColor: theme.backgroundElement,
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
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radii.medium,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
