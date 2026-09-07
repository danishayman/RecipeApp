import { Pressable, StyleSheet, View } from 'react-native';

import { RecipeImage } from '@/components/recipe-image';
import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { recipeTypeLabel } from '@/data/recipe-catalog';
import { useTheme } from '@/hooks/use-theme';
import type { Recipe } from '@/types/recipe';

interface RecipeCardProps {
  recipe: Recipe;
  /** Opens the detail screen. Omitted while the card is non-interactive. */
  onPress?: () => void;
}

/** Summary row for one recipe in the listing. */
export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={onPress === undefined}
      accessibilityRole="button"
      accessibilityLabel={`${recipe.title}, ${recipeTypeLabel(recipe.typeId)}`}
      accessibilityHint={onPress === undefined ? undefined : 'Opens the full recipe'}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? theme.backgroundSelected : theme.backgroundElement,
          borderColor: theme.border,
        },
      ]}>
      <RecipeImage
        uri={recipe.imageUri}
        typeId={recipe.typeId}
        emojiSize={34}
        style={styles.thumbnail}
      />

      <View style={styles.body}>
        <ThemedText type="smallBold" numberOfLines={2}>
          {recipe.title}
        </ThemedText>

        <View style={[styles.chip, { backgroundColor: theme.backgroundSelected }]}>
          <ThemedText type="small" themeColor="textSecondary">
            {recipeTypeLabel(recipe.typeId)}
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
    flexDirection: 'row',
    gap: Spacing.three,
    padding: Spacing.two,
    borderRadius: Radii.medium,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thumbnail: {
    width: 92,
    height: 92,
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
