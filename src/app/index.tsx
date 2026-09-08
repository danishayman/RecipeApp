import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { EmptyState } from '@/components/empty-state';
import { RecipeCard } from '@/components/recipe-card';
import { RecipeTypePicker } from '@/components/recipe-type-picker';
import { SearchField } from '@/components/search-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxGridWidth, Spacing } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import { useRecipeFilter } from '@/hooks/use-recipe-filter';
import { useRecipeTypes } from '@/hooks/use-recipe-types';
import { useRecipes } from '@/state/recipes-provider';
import { ALL_TYPES } from '@/types/recipe';

/**
 * Recipe listing screen.
 *
 * Composes three hooks: the shared collection, the screen-local category
 * filter over it, and the layout description that decides between a list and
 * a grid. The screen itself only arranges what they return.
 */
export default function RecipeListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { columns, prefersTiles } = useLayout();
  const { labelFor } = useRecipeTypes();
  const { recipes, status, error, reload } = useRecipes();
  const { typeFilter, setTypeFilter, query, setQuery, hasQuery, visibleRecipes, summary } =
    useRecipeFilter(recipes);

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
  const isFiltered = typeFilter !== ALL_TYPES;

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
        // Row cards are ruled off from each other; only the grid needs a gap.
        ItemSeparatorComponent={isGrid ? () => <View style={styles.separator} /> : undefined}
        ListHeaderComponent={
          <View style={styles.header}>
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder={`Search ${recipes.length} recipes, ingredients, steps`}
            />
            <RecipeTypePicker
              label="Filter by type"
              value={typeFilter}
              onChange={setTypeFilter}
              includeAllOption
              accessibilityHint="Narrows the list to a single category"
            />
            <ThemedText type="meta" themeColor="textSecondary">
              {summary}
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          hasQuery ? (
            <EmptyState
              emoji="🔍"
              title="Nothing matches"
              message={`No recipe mentions “${query.trim()}”.${
                isFiltered ? ` Try clearing the ${labelFor(typeFilter)} filter too.` : ''
              }`}
              action={<AppButton label="Clear search" onPress={() => setQuery('')} />}
            />
          ) : (
            <EmptyState
              emoji="🍽️"
              title={isFiltered ? `No ${labelFor(typeFilter)} yet` : 'No recipes yet'}
              message={
                isFiltered
                  ? 'Try another category, or add a recipe to this one.'
                  : 'Tap Add to write your first recipe.'
              }
              action={<AppButton label="Add a recipe" onPress={() => router.push('/add')} />}
            />
          )
        }
      />
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
