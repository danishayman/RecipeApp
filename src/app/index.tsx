import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { RECIPE_TYPES, SAMPLE_RECIPES, recipeTypeLabel } from '@/data/recipe-catalog';

/**
 * Recipe listing screen.
 *
 * Currently renders the bundled catalog directly. Storage-backed loading and
 * the type filter arrive in later phases.
 */
export default function RecipeListScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle">Recipes</ThemedText>
        <ThemedText themeColor="textSecondary">
          {RECIPE_TYPES.length} types · {SAMPLE_RECIPES.length} sample recipes
        </ThemedText>

        {SAMPLE_RECIPES.map((recipe) => (
          <ThemedView key={recipe.id} type="backgroundElement" style={styles.card}>
            <ThemedText type="smallBold">{recipe.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {recipeTypeLabel(recipe.typeId)} · {recipe.ingredients.length} ingredients ·{' '}
              {recipe.steps.length} steps
            </ThemedText>
          </ThemedView>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    gap: Spacing.two,
  },
  card: {
    padding: Spacing.three,
    borderRadius: Radii.medium,
    gap: Spacing.one,
  },
});
