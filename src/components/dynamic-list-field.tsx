import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface DynamicListFieldProps {
  label: string;
  /** The rows. Always render at least one so the field is never empty. */
  values: string[];
  onChange: (values: string[]) => void;
  /** Placeholder for a row, given its zero-based index. */
  placeholder: (index: number) => string;
  /** Label for the button that appends a row. */
  addLabel: string;
  /** Numbers each row, used for method steps. */
  ordered?: boolean;
  error?: string | null;
}

/**
 * A list of free-text rows the user can grow and shrink.
 *
 * Used for both ingredients and method steps. The last remaining row is
 * cleared rather than removed, so the field always offers somewhere to type.
 */
export function DynamicListField({
  label,
  values,
  onChange,
  placeholder,
  addLabel,
  ordered = false,
  error = null,
}: DynamicListFieldProps) {
  const theme = useTheme();
  const hasError = error !== null && error.length > 0;

  const setValueAt = (index: number, next: string) => {
    onChange(values.map((value, position) => (position === index ? next : value)));
  };

  const removeAt = (index: number) => {
    onChange(values.length === 1 ? [''] : values.filter((_, position) => position !== index));
  };

  return (
    <View style={styles.container}>
      <ThemedText type="label" themeColor="textSecondary">
        {label}
      </ThemedText>

      {values.map((value, index) => (
        <View key={index} style={[styles.row, { borderBottomColor: theme.border }]}>
          {ordered ? (
            <View style={[styles.ordinal, { backgroundColor: theme.backgroundSelected }]}>
              <ThemedText type="meta" themeColor="textSecondary">
                {index + 1}
              </ThemedText>
            </View>
          ) : null}

          <TextInput
            value={value}
            onChangeText={(next) => setValueAt(index, next)}
            placeholder={placeholder(index)}
            placeholderTextColor={theme.textSecondary}
            multiline
            accessibilityLabel={`${label} ${index + 1}`}
            style={[
              styles.input,
              {
                backgroundColor: 'transparent',
                borderColor: hasError ? theme.danger : 'transparent',
                color: theme.text,
              },
            ]}
          />

          <Pressable
            onPress={() => removeAt(index)}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${label} ${index + 1}`}
            style={({ pressed }) => [
              styles.remove,
              {
                backgroundColor: pressed ? theme.backgroundSelected : 'transparent',
              },
            ]}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              ✕
            </ThemedText>
          </Pressable>
        </View>
      ))}

      <Pressable
        onPress={() => onChange([...values, ''])}
        accessibilityRole="button"
        accessibilityLabel={addLabel}
        style={({ pressed }) => [styles.add, { opacity: pressed ? 0.7 : 1 }]}>
        <ThemedText type="label" style={{ color: theme.accentStrong }}>
          + {addLabel}
        </ThemedText>
      </Pressable>

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
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  ordinal: {
    width: 28,
    height: 52,
    borderRadius: Radii.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 0,
    paddingVertical: Spacing.two,
    borderWidth: 0,
    fontFamily: Fonts.sans,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  remove: {
    width: 36,
    height: 46,
    borderRadius: Radii.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: {
    alignSelf: 'flex-start',
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
});
