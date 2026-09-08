import { Pressable, StyleSheet, View } from 'react-native';

import { RecipeImage } from '@/components/recipe-image';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useRecipeTypes } from '@/hooks/use-recipe-types';
import { useTheme } from '@/hooks/use-theme';
import type { Recipe } from '@/types/recipe';

/**
 * `row` is the recipe-box entry: a square thumbnail beside serif type, ruled
 * off from the next row rather than boxed. It is what a phone sees.
 *
 * `tile` keeps a bordered card for the tablet grid, where rules alone would not
 * separate columns.
 */
export type RecipeCardLayout = 'row' | 'tile';

interface RecipeCardProps {
  recipe: Recipe;
  /** Opens the detail screen. Omitted while the card is non-interactive. */
  onPress?: () => void;
  layout?: RecipeCardLayout;
}

/** Summary of one recipe in the listing. */
export function RecipeCard({ recipe, onPress, layout = 'row' }: RecipeCardProps) {
  const theme = useTheme();
  const { labelFor } = useRecipeTypes();
  const isTile = layout === 'tile';

  const meta = `${labelFor(recipe.typeId)} · ${recipe.prepMinutes} min · serves ${recipe.servings}`;

  return (
    <Pressable
      onPress={onPress}
      disabled={onPress === undefined}
      accessibilityRole="button"
      accessibilityLabel={`${recipe.title}, ${labelFor(recipe.typeId)}`}
      accessibilityHint={onPress === undefined ? undefined : 'Opens the full recipe'}
      style={({ pressed }) => [
        isTile ? styles.tile : styles.row,
        isTile
          ? { backgroundColor: theme.backgroundElement, borderColor: theme.border }
          : { borderBottomColor: theme.border },
        pressed && { backgroundColor: theme.backgroundSelected },
      ]}>
      <RecipeImage
        uri={recipe.imageUri}
        typeId={recipe.typeId}
        emojiSize={isTile ? 40 : 26}
        style={isTile ? styles.cover : styles.thumbnail}
      />

      <View style={isTile ? styles.tileBody : styles.body}>
        <ThemedText type={isTile ? 'headingSmall' : 'heading'} numberOfLines={2}>
          {recipe.title}
        </ThemedText>

        <ThemedText type="meta" themeColor="textSecondary" numberOfLines={1}>
          {meta}
        </ThemedText>

        {recipe.description.length > 0 ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {recipe.description}
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    // The rule between entries carries the separation, so the list itself
    // renders no gap between rows.
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tile: {
    flexDirection: 'column',
    gap: Spacing.two,
    padding: Spacing.two,
    borderRadius: Radii.medium,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: Radii.small,
  },
  cover: {
    width: '100%',
    aspectRatio: 1,
    // Without a ceiling a wide tile grows tall enough to push the title off
    // screen on a short window.
    maxHeight: 200,
    borderRadius: Radii.small,
  },
  body: {
    flex: 1,
    gap: Spacing.one,
  },
  tileBody: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.half,
    paddingBottom: Spacing.one,
  },
});
