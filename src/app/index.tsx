import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { RecipeCard } from '@/components/recipe-card';
import { RecipeTypePicker } from '@/components/recipe-type-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { recipeTypeLabel } from '@/data/recipe-catalog';
import { useTheme } from '@/hooks/use-theme';
import { useRecipes } from '@/state/recipes-provider';
import { ALL_TYPES, type Recipe } from '@/types/recipe';

/**
 * Recipe listing screen.
 *
 * Shows every stored recipe, narrowed by the category spinner. The filter is
 * screen-local state; the collection itself lives in `RecipesProvider`.
 */
export default function RecipeListScreen() {
  const { recipes, status, error, reload } = useRecipes();
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPES);

  const visibleRecipes = useMemo<Recipe[]>(
    () =>
      typeFilter === ALL_TYPES
        ? recipes
        : recipes.filter((recipe) => recipe.typeId === typeFilter),
    [recipes, typeFilter]
  );

  if (status === 'loading') {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
        <ThemedText type="small" themeColor="textSecondary">
          Loading your recipes…
        </ThemedText>
      </ThemedView>
    );
  }

  if (status === 'error') {
    return (
      <ThemedView style={styles.centered}>
        <EmptyState
          emoji="⚠️"
          title="We could not open your recipes"
          message={error ?? 'Something went wrong.'}
          action={<RetryButton onPress={() => void reload()} />}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={visibleRecipes}
        keyExtractor={(recipe) => recipe.id}
        renderItem={({ item }) => <RecipeCard recipe={item} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <RecipeTypePicker
              label="Filter by type"
              value={typeFilter}
              onChange={setTypeFilter}
              includeAllOption
              accessibilityHint="Narrows the list to a single category"
            />
            <ThemedText type="small" themeColor="textSecondary">
              {describeCount(visibleRecipes.length, typeFilter)}
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            emoji="🍽️"
            title={
              typeFilter === ALL_TYPES ? 'No recipes yet' : `No ${recipeTypeLabel(typeFilter)} yet`
            }
            message={
              typeFilter === ALL_TYPES
                ? 'Add your first recipe to get started.'
                : 'Try another category, or add a recipe to this one.'
            }
          />
        }
      />
    </ThemedView>
  );
}

/** Pluralised summary of what the list is currently showing. */
function describeCount(count: number, typeFilter: string): string {
  const noun = count === 1 ? 'recipe' : 'recipes';

  return typeFilter === ALL_TYPES
    ? `${count} ${noun}`
    : `${count} ${noun} in ${recipeTypeLabel(typeFilter)}`;
}

function RetryButton({ onPress }: { onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.retry,
        { backgroundColor: theme.accent, opacity: pressed ? 0.8 : 1 },
      ]}>
      <ThemedText type="smallBold" style={{ color: theme.onAccent }}>
        Try again
      </ThemedText>
    </Pressable>
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
    gap: Spacing.two,
    padding: Spacing.four,
  },
  listContent: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  header: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  separator: {
    height: Spacing.two,
  },
  retry: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Radii.pill,
    marginTop: Spacing.two,
  },
});
