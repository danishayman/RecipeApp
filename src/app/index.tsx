import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { recipeTypeLabel } from '@/data/recipe-catalog';
import { recipeRepository } from '@/storage/recipe-repository';
import type { Recipe } from '@/types/recipe';

/**
 * Recipe listing screen.
 *
 * Reads from device storage, which seeds itself with the bundled samples on
 * first launch. The card layout and type filter arrive in the listing phase.
 */
export default function RecipeListScreen() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setRecipes(await recipeRepository.loadAll());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (error !== null) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText themeColor="danger">{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="subtitle">Recipes</ThemedText>
        <ThemedText themeColor="textSecondary">{recipes.length} stored on this device</ThemedText>

        {recipes.map((recipe) => (
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
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
