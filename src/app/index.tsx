import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/app-button';
import { EmptyState } from '@/components/empty-state';
import { RecipeCard } from '@/components/recipe-card';
import { SearchField } from '@/components/search-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxGridWidth, Radii, Spacing } from '@/constants/theme';
import { useLayout } from '@/hooks/use-layout';
import { useRecipeFilter } from '@/hooks/use-recipe-filter';
import { useRecipeTypes } from '@/hooks/use-recipe-types';
import { useRecipes } from '@/state/recipes-provider';
import { useAuth } from '@/state/auth-provider';
import { useTheme } from '@/hooks/use-theme';
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
  const { labelFor, types } = useRecipeTypes();
  const { recipes, status, error, reload } = useRecipes();
  const { signOut } = useAuth();
  const theme = useTheme();
  // Some Android edge-to-edge configurations report a zero top inset while
  // the status bar still overlays the app. Keep a 24pt fallback so the
  // masthead can never sit underneath the notification icons.
  const topPadding = Math.max(insets.top, Spacing.four) + Spacing.one;
  const { typeFilter, setTypeFilter, query, setQuery, hasQuery, visibleRecipes, summary } =
    useRecipeFilter(recipes);
  const signOutFromBook = useCallback(() => {
    Alert.alert('Sign out of YumBook?', 'Your recipes stay safely on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
    ]);
  }, [signOut]);

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
          { paddingTop: topPadding },
          // Keep the last card clear of the home indicator or navigation bar.
          { paddingBottom: insets.bottom + Spacing.four },
        ]}
        // Row cards are ruled off from each other; only the grid needs a gap.
        ItemSeparatorComponent={isGrid ? () => <View style={styles.separator} /> : undefined}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.masthead}>
              <View style={styles.brandBlock}>
                <ThemedText type="label" style={{ color: theme.accentStrong }}>
                  Kitchen note
                </ThemedText>
                <ThemedText type="subtitle" style={styles.pageTitle}>
                  YumBook
                </ThemedText>
              </View>
              <View style={styles.headerActions}>
                <Pressable
                  onPress={signOutFromBook}
                  accessibilityRole="button"
                  accessibilityLabel="Sign out"
                  hitSlop={Spacing.two}
                  style={({ pressed }) => [styles.signOut, { opacity: pressed ? 0.55 : 1 }]}>
                  <ThemedText type="label" themeColor="textSecondary">
                    Sign out
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => router.push('/add')}
                  accessibilityRole="button"
                  accessibilityLabel="Add a new recipe"
                  style={({ pressed }) => [
                    styles.newRecipe,
                    { backgroundColor: theme.accent, opacity: pressed ? 0.82 : 1 },
                  ]}>
                  <ThemedText type="label" style={{ color: theme.onAccent }}>
                    + New recipe
                  </ThemedText>
                </Pressable>
              </View>
            </View>
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder={`Search ${recipes.length} recipes, ingredients, steps`}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              accessibilityRole="tablist">
              <RecipeTypeChip
                label={`All ${recipes.length}`}
                selected={typeFilter === ALL_TYPES}
                onPress={() => setTypeFilter(ALL_TYPES)}
              />
              {types.map((type) => (
                <RecipeTypeChip
                  key={type.id}
                  label={`${type.emoji}  ${type.label}`}
                  selected={typeFilter === type.id}
                  onPress={() => setTypeFilter(type.id)}
                />
              ))}
            </ScrollView>
            <View style={[styles.summaryRule, { borderBottomColor: theme.border }]}>
              <ThemedText type="meta" themeColor="textSecondary">
                {summary}
              </ThemedText>
              <ThemedText type="meta" themeColor="textSecondary">
                A–Z
              </ThemedText>
            </View>
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

function RecipeTypeChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.accent : theme.background,
          borderColor: selected ? theme.accent : theme.border,
          opacity: pressed ? 0.76 : 1,
        },
      ]}>
      <ThemedText type="label" style={{ color: selected ? theme.onAccent : theme.text }}>
        {label}
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
    maxWidth: MaxGridWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
  },
  header: {
    gap: Spacing.two,
    paddingBottom: Spacing.three,
  },
  masthead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: Spacing.one,
    paddingBottom: Spacing.two,
  },
  brandBlock: {
    gap: Spacing.half,
  },
  pageTitle: {
    fontSize: 38,
    lineHeight: 42,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  signOut: {
    minHeight: 18,
    justifyContent: 'center',
  },
  newRecipe: {
    minHeight: 36,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.pill,
  },
  chips: {
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  chip: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  summaryRule: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
