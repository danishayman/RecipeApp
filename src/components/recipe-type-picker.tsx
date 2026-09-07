import { Picker } from '@react-native-picker/picker';
import { Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { findRecipeType, RECIPE_TYPES } from '@/data/recipe-catalog';
import { useTheme } from '@/hooks/use-theme';
import { ALL_TYPES } from '@/types/recipe';

interface RecipeTypePickerProps {
  /** The selected type id, or `ALL_TYPES` when `includeAllOption` is set. */
  value: string;
  onChange: (typeId: string) => void;
  /** Adds a leading "All types" entry. Used by the list filter, not by forms. */
  includeAllOption?: boolean;
  /** Field label rendered above the control. */
  label: string;
  accessibilityHint?: string;
}

/**
 * The system spinner for choosing a recipe category.
 *
 * Options come from `recipetypes.json` via the catalog, so the list screen
 * filter and the add/edit forms can never drift apart.
 */
export function RecipeTypePicker({
  value,
  onChange,
  includeAllOption = false,
  label,
  accessibilityHint,
}: RecipeTypePickerProps) {
  const theme = useTheme();

  // A recipe saved under a category that has since been removed from
  // recipetypes.json would otherwise select nothing and render a blank field.
  // Offering the orphaned value keeps the control honest about what is set.
  const isOrphanedValue =
    value.length > 0 && value !== ALL_TYPES && findRecipeType(value) === undefined;

  return (
    <View style={styles.container}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.label}>
        {label}
      </ThemedText>

      <View
        style={[
          styles.field,
          { backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}>
        <Picker
          selectedValue={value}
          onValueChange={(selected) => onChange(String(selected))}
          dropdownIconColor={theme.text}
          accessibilityLabel={label}
          accessibilityHint={accessibilityHint}
          style={[styles.picker, { color: theme.text }]}
          // itemStyle only applies to the iOS wheel picker.
          itemStyle={Platform.OS === 'ios' ? { color: theme.text } : undefined}>
          {includeAllOption ? (
            <Picker.Item label="All types" value={ALL_TYPES} color={theme.text} />
          ) : null}

          {isOrphanedValue ? (
            <Picker.Item label="Uncategorised" value={value} color={theme.text} />
          ) : null}

          {RECIPE_TYPES.map((type) => (
            <Picker.Item
              key={type.id}
              label={`${type.emoji}  ${type.label}`}
              value={type.id}
              color={theme.text}
            />
          ))}
        </Picker>
      </View>
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
  field: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.medium,
    overflow: 'hidden',
    justifyContent: 'center',
    // Android renders the spinner at its own intrinsic height; iOS needs a
    // bounded box or the wheel expands to fill the screen.
    height: Platform.OS === 'ios' ? 180 : 54,
  },
  picker: {
    width: '100%',
  },
});
