import { Picker } from '@react-native-picker/picker';
import { Platform, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useRecipeTypes } from '@/hooks/use-recipe-types';
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
  const { types, findType } = useRecipeTypes();

  // A recipe saved under a category that has since been removed from
  // recipetypes.json would otherwise select nothing and render a blank field.
  // Offering the orphaned value keeps the control honest about what is set.
  const isOrphanedValue = value.length > 0 && value !== ALL_TYPES && findType(value) === undefined;

  return (
    <View style={styles.container}>
      <ThemedText type="label" themeColor="textSecondary">
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

          {types.map((type) => (
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
    // Matches the search field beside it. Note this styles the closed field
    // only: the dropdown list is drawn by the Android spinner dialog, which
    // @react-native-picker/picker exposes no font control over.
    fontFamily: Fonts.sans,
    fontSize: 15,
  },
});
