import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  accessibilityLabel?: string;
}

/**
 * The list's free-text search.
 *
 * Unlike `TextField` this carries no label above it - the placeholder and the
 * glyph say what it is, which is what the design calls for and what keeps the
 * top of the list quiet.
 */
export function SearchField({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel = 'Search recipes',
}: SearchFieldProps) {
  const theme = useTheme();
  const hasValue = value.length > 0;

  return (
    <View
      style={[
        styles.field,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border },
      ]}>
      <SearchGlyph color={theme.textSecondary} />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        // iOS draws its own clear button; Android gets the one below.
        clearButtonMode="while-editing"
        style={[styles.input, { color: theme.text }]}
      />

      {hasValue ? (
        <Pressable
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={Spacing.two}
          style={({ pressed }) => [
            styles.clear,
            { backgroundColor: pressed ? theme.backgroundSelected : 'transparent' },
          ]}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            ✕
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

/**
 * A magnifier drawn from two views.
 *
 * The design uses the `⌕` character, but that glyph is missing from several
 * Android system fonts and would render as a blank box. Two views always draw.
 */
function SearchGlyph({ color }: { color: string }) {
  return (
    <View style={styles.glyph}>
      <View style={[styles.glyphLens, { borderColor: color }]} />
      <View style={[styles.glyphHandle, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: 52,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.medium,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.two,
    fontFamily: Fonts.sans,
    fontSize: 15,
  },
  clear: {
    width: 28,
    height: 28,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: {
    width: 16,
    height: 16,
  },
  glyphLens: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
  },
  glyphHandle: {
    position: 'absolute',
    right: 0,
    bottom: 1,
    width: 6,
    height: 1.5,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
});
