import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { EmptyState } from '@/components/empty-state';
import { RecipeCard } from '@/components/recipe-card';
import { RecipeTypePicker } from '@/components/recipe-type-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxGridWidth, Spacing } from '@/constants/theme';
import { recipeTypeLabel } from '@/data/recipe-catalog';
import { useLayout } from '@/hooks/use-layout';
import { useRecipes } from '@/state/recipes-provider';
import { ALL_TYPES, type Recipe } from '@/types/recipe';

/**
 * Recipe listing screen.
 *
 * Shows every stored recipe, narrowed by the category spinner. The filter is
 * screen-local state; the collection itself lives in `RecipesProvider`.
 *
 * The list lays out as a single column of row cards on a phone and as a grid
 * of tile cards from tablet width upwards, in either orientation.
 */
export default function RecipeListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { columns, prefersTiles } = useLayout();
  const { recipes, status, error, reload } = useRecipes();
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPES);

  const visibleRecipes = useMemo<Recipe[]>(
    () =>
      typeFilter === ALL_TYPES ? recipes : recipes.filter((recipe) => recipe.typeId === typeFilter),
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
          action={<AppButton label="Try again" onPress={() => void reload()} />}
        />
      </ThemedView>
    );
  }

  const isGrid = columns > 1;

  return (
    <ThemedView style={styles.container}>
      <FlatList
        // FlatList cannot change column count in place, so the key forces a
        // fresh list when the device rotates into or out of the grid.
        key={`columns-${columns}`}
        data={visibleRecipes}
        keyExtractor={(recipe) => recipe.id}
        numColumns={columns}
        columnWrapperStyle={isGrid ? styles.columnWrapper : undefined}
        renderItem={({ item }) => (
          // In a grid the cell divides the row evenly; in a single column the
          // card sizes itself and must not stretch to fill the viewport.
          <View style={isGrid ? styles.gridCell : undefined}>
            <RecipeCard
              recipe={item}
              layout={prefersTiles ? 'tile' : 'row'}
              onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: item.id } })}
            />
          </View>
        )}
        contentContainerStyle={[
          styles.listContent,
          // Keep the last card clear of the home indicator or navigation bar.
          { paddingBottom: insets.bottom + Spacing.four },
        ]}
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
                ? 'Tap Add to write your first recipe.'
                : 'Try another category, or add a recipe to this one.'
            }
            action={<AppButton label="Add a recipe" onPress={() => router.push('/add')} />}
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
    maxWidth: MaxGridWidth,
    alignSelf: 'center',
    padding: Spacing.three,
  },
  header: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  columnWrapper: {
    gap: Spacing.three,
    alignItems: 'stretch',
  },
  gridCell: {
    flex: 1,
  },
  separator: {
    height: Spacing.three,
  },
});
