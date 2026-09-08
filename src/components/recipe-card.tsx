import { Pressable, StyleSheet, View } from 'react-native';

import { RecipeImage } from '@/components/recipe-image';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useRecipeTypes } from '@/hooks/use-recipe-types';
import { useTheme } from '@/hooks/use-theme';
import type { Recipe } from '@/types/recipe';

/**
 * `row` places the thumbnail beside the text and suits a single column on a
 * phone. `tile` stacks a wide photo above the text and suits a grid on a
 * tablet or a landscape phone.
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

  return (
    <Pressable
      onPress={onPress}
      disabled={onPress === undefined}
      accessibilityRole="button"
      accessibilityLabel={`${recipe.title}, ${labelFor(recipe.typeId)}`}
      accessibilityHint={onPress === undefined ? undefined : 'Opens the full recipe'}
      style={({ pressed }) => [
        styles.card,
        isTile ? styles.cardTile : styles.cardRow,
        {
          backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
          borderColor: theme.border,
        },
      ]}>
      <RecipeImage
        uri={recipe.imageUri}
        typeId={recipe.typeId}
        emojiSize={isTile ? 48 : 34}
        style={isTile ? styles.cover : styles.thumbnail}
      />

      <View style={styles.body}>
        <ThemedText type="smallBold" numberOfLines={2}>
          {recipe.title}
        </ThemedText>

        <View style={[styles.chip, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText type="small" themeColor="textSecondary">
            {labelFor(recipe.typeId)}
          </ThemedText>
        </View>

        {recipe.description.length > 0 ? (
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {recipe.description}
          </ThemedText>
        ) : null}

        <ThemedText type="small" themeColor="textSecondary">
          {recipe.prepMinutes} min · serves {recipe.servings} · {ingredientCount(recipe)}
        </ThemedText>
      </View>
    </Pressable>
  );
}

/** Pluralised ingredient count, so a one-item recipe does not read "1 ingredients". */
function ingredientCount(recipe: Recipe): string {
  const count = recipe.ingredients.length;
  return `${count} ${count === 1 ? 'ingredient' : 'ingredients'}`;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.medium,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.two,
    gap: Spacing.three,
  },
  cardRow: {
    flexDirection: 'row',
  },
  cardTile: {
    flexDirection: 'column',
  },
  thumbnail: {
    width: 92,
    height: 92,
    borderRadius: Radii.small,
  },
  cover: {
    width: '100%',
    aspectRatio: 16 / 9,
    // Without a ceiling, a wide tile on a landscape phone grows tall enough
    // to push the title off screen.
    maxHeight: 180,
    borderRadius: Radii.small,
  },
  body: {
    flex: 1,
    gap: Spacing.one,
    paddingVertical: Spacing.half,
  },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radii.pill,
  },
});
